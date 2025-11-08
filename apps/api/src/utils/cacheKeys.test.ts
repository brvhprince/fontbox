import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { cacheKeys } from './cacheKeys.js';
import { sha256 } from './hash.js';

const originalEnv = { ...process.env };

describe('cache keys', () => {
  beforeAll(() => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_ACCESS_SECRET: 'access',
      JWT_REFRESH_SECRET: 'refresh',
      WEB_ORIGIN: 'http://localhost:3000',
      STORAGE_DRIVER: 'local',
    });
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  it('builds deterministic cache keys', () => {
    expect(cacheKeys.font('id')).toBe('font:id');
    expect(cacheKeys.fontsList('hash')).toBe('fonts:list:hash');
    expect(cacheKeys.tagsList).toBe('tags:list');
    expect(cacheKeys.projectsList('user')).toBe('projects:list:user');
  });

  it('produces stable list cache keys from filters', async () => {
    vi.resetModules();
    const { computeListCacheKey } = await import('../services/fontService.js');
    const filters = { search: 'demo', page: 1, pageSize: 10 };
    const keyA = computeListCacheKey(filters);
    const keyB = computeListCacheKey({ search: 'demo', page: 1, pageSize: 10 });
    const expected = cacheKeys.fontsList(sha256(Buffer.from(JSON.stringify(filters))));
    expect(keyA).toBe(expected);
    expect(keyB).toBe(keyA);
  });
});
