import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { HttpError } from '../middleware/errorHandler.js';
import { cacheKeys } from '../utils/cacheKeys.js';
import { slugify } from '../utils/slugify.js';

export async function listTags() {
  try {
    const cached = await redis.get(cacheKeys.tagsList);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    // ignore redis
  }

  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });

  try {
    await redis.set(cacheKeys.tagsList, JSON.stringify(tags), 'EX', 300);
  } catch (error) {
    // ignore redis
  }

  return tags;
}

export async function createOrGetTag(name: string) {
  const slug = slugify(name);
  const tag = await prisma.tag.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  });
  await invalidate();
  return tag;
}

export async function updateTag(id: string, name: string) {
  const tag = await prisma.tag.update({ where: { id }, data: { name, slug: slugify(name) } });
  await invalidate();
  return tag;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  await invalidate();
}

async function invalidate() {
  try {
    await redis.del(cacheKeys.tagsList);
  } catch (error) {
    // ignore
  }
}
