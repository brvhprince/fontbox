import type { Express } from 'express';
import { prisma } from '../config/prisma.js';
import { getStorageDriver } from '../storage/index.js';
import { HttpError } from '../middleware/errorHandler.js';
import { sha256 } from '../utils/hash.js';
import { cacheKeys } from '../utils/cacheKeys.js';
import { redis } from '../config/redis.js';
import { slugify } from '../utils/slugify.js';
import { generatePreview } from './previewService.js';

interface DetectedFont {
  extension: string;
  mimeType: string;
  format: string;
}

const FONT_SIGNATURES: { signature: number[] | string; extension: string; mimeType: string; format: string }[] = [
  { signature: [0x00, 0x01, 0x00, 0x00], extension: 'ttf', mimeType: 'font/ttf', format: 'truetype' },
  { signature: 'OTTO', extension: 'otf', mimeType: 'font/otf', format: 'opentype' },
  { signature: 'wOFF', extension: 'woff', mimeType: 'font/woff', format: 'woff' },
  { signature: 'wOF2', extension: 'woff2', mimeType: 'font/woff2', format: 'woff2' },
];

export interface UploadFontPayload {
  name?: string;
  description?: string;
  categoryId?: string;
  projectId?: string;
  tags?: string[];
}

export interface FontListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  tagIds?: string[];
  categoryId?: string;
  projectId?: string;
}

export function detectFont(buffer: Buffer): DetectedFont | null {
  for (const signature of FONT_SIGNATURES) {
    if (typeof signature.signature === 'string') {
      const prefix = buffer.subarray(0, signature.signature.length).toString('ascii');
      if (prefix === signature.signature) {
        return signature;
      }
    } else {
      const matches = signature.signature.every((value, index) => buffer[index] === value);
      if (matches) {
        return signature;
      }
    }
  }

  return null;
}

async function ensureTags(tagNames: string[]) {
  const unique = [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];
  const tagIds: string[] = [];
  for (const name of unique) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
    tagIds.push(tag.id);
  }
  return tagIds;
}

async function invalidateFontCaches(fontId: string, listKey?: string) {
  const keys = [cacheKeys.font(fontId)];
  if (listKey) {
    keys.push(listKey);
  }
  try {
    const patternKeys = await redis.keys('fonts:list:*');
    if (patternKeys.length) {
      keys.push(...patternKeys);
    }
    await redis.del(...keys);
  } catch (error) {
    // ignore redis errors for cache invalidation
  }
}

export function computeListCacheKey(filters: FontListFilters) {
  const payload = JSON.stringify(filters);
  return cacheKeys.fontsList(sha256(Buffer.from(payload)));
}

export async function uploadFont(userId: string, file: Express.Multer.File, payload: UploadFontPayload) {
  if (!file?.buffer) {
    throw new HttpError(400, 'Font file missing');
  }

  const detection = detectFont(file.buffer);
  if (!detection) {
    throw new HttpError(400, 'Unsupported font format');
  }

  const hash = sha256(file.buffer);
  const existing = await prisma.font.findUnique({
    where: { sha256: hash },
    include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
  });

  if (existing) {
    return { font: existing, duplicate: true };
  }

  const storage = getStorageDriver();
  const key = `fonts/${hash}.${detection.extension}`;
  await storage.putObject({ key, body: file.buffer, contentType: detection.mimeType });

  const tagIds = payload.tags ? await ensureTags(payload.tags) : [];

  const font = await prisma.font.create({
    data: {
      name: payload.name ?? file.originalname.replace(/\.[^.]+$/, ''),
      description: payload.description,
      fileName: key,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: detection.mimeType,
      storageKey: key,
      sha256: hash,
      metadata: {
        format: detection.format,
        extension: detection.extension,
      },
      userId,
      categoryId: payload.categoryId,
      projectId: payload.projectId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
  });

  const preview = await generatePreview(font.id, font.name, file.buffer);
  const previewKey = `previews/${font.id}.png`;
  await storage.putObject({ key: previewKey, body: preview.buffer, contentType: 'image/png' });

  await prisma.preview.create({
    data: {
      fontId: font.id,
      storageKey: previewKey,
      width: preview.width,
      height: preview.height,
    },
  });

  const updated = await prisma.font.update({
    where: { id: font.id },
    data: { previewReady: true },
    include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
  });

  await invalidateFontCaches(font.id);

  return { font: updated, duplicate: false };
}

export async function listFonts(filters: FontListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters.tagIds?.length) {
    where.tags = {
      some: {
        tagId: { in: filters.tagIds },
      },
    };
  }

  const cacheKey = computeListCacheKey({ ...filters, page, pageSize });
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // ignore redis errors
  }

  const [items, total] = await Promise.all([
    prisma.font.findMany({
      where,
      include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.font.count({ where }),
  ]);

  const result = { items, total, page, pageSize };
  try {
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
  } catch (error) {
    // ignore redis errors
  }

  return result;
}

export async function getFontById(id: string) {
  const cacheKey = cacheKeys.font(id);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    // ignore redis errors
  }

  const font = await prisma.font.findUnique({
    where: { id },
    include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
  });

  if (!font) {
    throw new HttpError(404, 'Font not found');
  }

  try {
    await redis.set(cacheKey, JSON.stringify(font), 'EX', 60);
  } catch (error) {
    // ignore redis
  }

  return font;
}

export async function updateFont(id: string, data: UploadFontPayload) {
  const font = await getFontById(id);
  const tagIds = data.tags ? await ensureTags(data.tags) : undefined;

  const updated = await prisma.font.update({
    where: { id },
    data: {
      name: data.name ?? font.name,
      description: data.description ?? font.description,
      categoryId: data.categoryId === undefined ? undefined : data.categoryId,
      projectId: data.projectId === undefined ? undefined : data.projectId,
      tags: tagIds
        ? {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
  });

  await invalidateFontCaches(id);

  return updated;
}

export async function deleteFont(id: string) {
  const font = await getFontById(id);
  const storage = getStorageDriver();
  await storage.deleteObject(font.storageKey);
  for (const preview of font.previews) {
    await storage.deleteObject(preview.storageKey);
  }
  await prisma.font.delete({ where: { id } });
  await invalidateFontCaches(id);
}

export async function getDuplicateByHash(hash: string) {
  const font = await prisma.font.findUnique({
    where: { sha256: hash },
    include: { category: true, project: true, tags: { include: { tag: true } }, previews: true },
  });
  if (!font) {
    throw new HttpError(404, 'Duplicate not found');
  }
  return font;
}

export async function getFontStream(id: string) {
  const font = await getFontById(id);
  const storage = getStorageDriver();
  const stream = await storage.getObjectStream(font.storageKey);
  return { stream, font };
}
