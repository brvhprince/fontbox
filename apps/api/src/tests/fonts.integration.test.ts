import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import type { Express } from 'express';
import type { PrismaClient } from '@prisma/client';
import type Redis from 'ioredis';

const generatePreviewMock = vi.fn(async (fontId: string) => ({
  buffer: Buffer.from(`preview-${fontId}`),
  width: 320,
  height: 180,
}));

vi.mock('../services/previewService.js', () => ({
  generatePreview: generatePreviewMock,
}));

describe('fonts integration', () => {
  let pgContainer: PostgreSqlContainer;
  let redisContainer: RedisContainer;
  let redisClient: Redis;
  let prisma: PrismaClient;
  let app: Express;
  let computeListCacheKey: (filters: any) => string;
  const fontBuffer = Buffer.concat([Buffer.from([0x00, 0x01, 0x00, 0x00]), Buffer.from('integration-font')]);
  const storageDir = 'tmp/integration-storage';
  const storageRoot = resolve(process.cwd(), 'apps', storageDir);

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('fontbox')
      .withUsername('fontbox')
      .withPassword('fontbox')
      .start();
    redisContainer = await new RedisContainer('redis:7-alpine').start();

    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = pgContainer.getConnectionUri();
    process.env.REDIS_URL = redisContainer.getConnectionUrl();
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '30d';
    process.env.BCRYPT_SALT_ROUNDS = '4';
    process.env.WEB_ORIGIN = 'http://localhost:3000';
    process.env.SESSION_COOKIE_NAME = 'fontbox_session';
    process.env.REFRESH_COOKIE_NAME = 'fontbox_refresh';
    process.env.COOKIE_DOMAIN = '';
    process.env.COOKIE_SECURE = 'false';
    process.env.STORAGE_DRIVER = 'local';
    process.env.STORAGE_DIR = storageDir;
    process.env.PORT = '0';
    process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';

    await fs.rm(storageRoot, { recursive: true, force: true });
    await fs.mkdir(storageRoot, { recursive: true });

    vi.resetModules();

    const { execa } = await import('execa');
    await execa('pnpm', ['prisma', 'migrate', 'deploy'], {
      cwd: resolve(process.cwd(), 'apps/api'),
      env: process.env,
      stdout: 'inherit',
      stderr: 'inherit',
    });

    await execa('pnpm', ['prisma:seed'], {
      cwd: resolve(process.cwd(), 'apps/api'),
      env: process.env,
      stdout: 'inherit',
      stderr: 'inherit',
    });

    const appModule = await import('../app.js');
    app = appModule.app;
    const prismaModule = await import('../config/prisma.js');
    prisma = prismaModule.prisma;
    const redisModule = await import('../config/redis.js');
    redisClient = redisModule.redis;
    ({ computeListCacheKey } = await import('../services/fontService.js'));
    await redisClient.connect();
    await redisClient.flushall();
  });

  afterAll(async () => {
    await redisClient?.quit();
    await prisma?.$disconnect();
    await fs.rm(storageRoot, { recursive: true, force: true });
    await pgContainer?.stop();
    await redisContainer?.stop();
  });

  beforeEach(async () => {
    generatePreviewMock.mockClear();
    await redisClient.flushall();
    await prisma.preview.deleteMany();
    await prisma.fontTag.deleteMany();
    await prisma.font.deleteMany();
  });

  it('handles upload, preview, listing, detail, download, and duplicates', async () => {
    const register = await request(app).post('/api/auth/register').send({
      email: 'integration@fontbox.dev',
      password: 'Password123!',
      displayName: 'Integration User',
    });

    expect(register.status).toBe(201);
    const accessToken = register.body.accessToken as string;

    const upload = await request(app)
      .post('/api/fonts/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('font', fontBuffer, { filename: 'demo.ttf', contentType: 'font/ttf' })
      .field('name', 'Integration Font')
      .field('description', 'Font used for integration testing')
      .field('tags', JSON.stringify(['Integration', 'Modern']));

    expect([200, 201]).toContain(upload.status);
    expect(upload.body.duplicate).toBe(false);
    const fontId = upload.body.font.id as string;
    expect(generatePreviewMock).toHaveBeenCalledWith(fontId, 'Integration Font', expect.any(Buffer));

    const preview = await prisma.preview.findFirst({ where: { fontId } });
    expect(preview).not.toBeNull();
    expect(preview?.storageKey).toBe(`previews/${fontId}.png`);

    const list = await request(app).get('/api/fonts').set('Authorization', `Bearer ${accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].id).toBe(fontId);
    const cachedList = await redisClient.get(computeListCacheKey({ page: 1, pageSize: 20 }));
    expect(cachedList).not.toBeNull();

    const detail = await request(app).get(`/api/fonts/${fontId}`).set('Authorization', `Bearer ${accessToken}`);
    expect(detail.status).toBe(200);
    expect(detail.body.id).toBe(fontId);

    const download = await request(app)
      .get(`/api/fonts/${fontId}/download`)
      .set('Authorization', `Bearer ${accessToken}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(download.status).toBe(200);
    expect(download.headers['content-type']).toBe('font/ttf');
    expect((download.body as Buffer).equals(fontBuffer)).toBe(true);

    const duplicate = await request(app)
      .post('/api/fonts/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('font', fontBuffer, { filename: 'duplicate.ttf', contentType: 'font/ttf' })
      .field('name', 'Duplicate Font');

    expect(duplicate.status).toBe(200);
    expect(duplicate.body.duplicate).toBe(true);
    expect(duplicate.body.font.id).toBe(fontId);
  });
});
