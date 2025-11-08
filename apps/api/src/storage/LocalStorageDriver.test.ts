import { promises as fs } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

const storageDir = 'tmp/storage-tests';

vi.mock('../config/env.js', () => ({
  env: {
    STORAGE_DIR: storageDir,
  },
}));

describe('LocalStorageDriver', () => {
  let driver: import('./LocalStorageDriver.js').LocalStorageDriver;
  let storageRoot: string;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('./LocalStorageDriver.js');
    driver = new module.LocalStorageDriver();
    const { dirname } = await import('path');
    const driverUrl = new URL('./LocalStorageDriver.ts', import.meta.url);
    const rootDir = join(dirname(driverUrl.pathname), '../../..');
    storageRoot = join(rootDir, storageDir);
    await fs.rm(storageRoot, { recursive: true, force: true });
    await fs.mkdir(storageRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(storageRoot, { recursive: true, force: true });
  });

  it('writes objects to disk and returns their key', async () => {
    const result = await driver.putObject({
      key: 'fonts/sample.ttf',
      body: Buffer.from('font-data'),
      contentType: 'font/ttf',
    });

    const written = await fs.readFile(join(storageRoot, 'fonts/sample.ttf'));
    expect(written.toString()).toBe('font-data');
    expect(result).toEqual({ key: 'fonts/sample.ttf' });
  });

  it('streams files from disk', async () => {
    const filePath = join(storageRoot, 'fonts/font.ttf');
    await fs.mkdir(join(storageRoot, 'fonts'), { recursive: true });
    await fs.writeFile(filePath, Buffer.from('streamed'));

    const stream = await driver.getObjectStream('fonts/font.ttf');
    const chunks: Buffer[] = [];
    for await (const chunk of stream as Readable) {
      chunks.push(Buffer.from(chunk));
    }
    expect(Buffer.concat(chunks).toString()).toBe('streamed');
  });

  it('deletes files if they exist', async () => {
    const filePath = join(storageRoot, 'fonts/delete.ttf');
    await fs.mkdir(join(storageRoot, 'fonts'), { recursive: true });
    await fs.writeFile(filePath, Buffer.from('data'));

    await driver.deleteObject('fonts/delete.ttf');
    await expect(fs.access(filePath)).rejects.toThrow();
  });

  it('creates predictable public urls', () => {
    expect(driver.getPublicUrl('fonts/sample.ttf')).toBe('/storage/fonts/sample.ttf');
  });
});
