import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const originalEnv = { ...process.env };

describe('env configuration', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('parses required environment variables', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_ACCESS_SECRET: 'access',
      JWT_REFRESH_SECRET: 'refresh',
      WEB_ORIGIN: 'http://localhost:3000',
      STORAGE_DRIVER: 'local',
    });

    const module = await import('./env.js');
    expect(module.env.PORT).toBe(3001);
    expect(module.env.COOKIE_SECURE).toBe(false);
    expect(module.env.STORAGE_DRIVER).toBe('local');
  });

  it('throws when required values are missing', async () => {
    Object.assign(process.env, {
      DATABASE_URL: '',
      REDIS_URL: '',
    });

    await expect(import('./env.js')).rejects.toThrow('Invalid environment configuration');
  });
});
