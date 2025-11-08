import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { StorageDriver, StoredObject } from './StorageDriver.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '../../..');
const storageRoot = join(rootDir, env.STORAGE_DIR);

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

export class LocalStorageDriver implements StorageDriver {
  async putObject({ key, body }: { key: string; body: Buffer; contentType: string }): Promise<StoredObject> {
    const filePath = join(storageRoot, key);
    await ensureDir(dirname(filePath));
    await fs.writeFile(filePath, body);
    return { key };
  }

  async getObjectStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = join(storageRoot, key);
    return createReadStream(filePath);
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = join(storageRoot, key);
    await fs.rm(filePath, { force: true });
  }

  getPublicUrl(key: string): string {
    return `/storage/${key}`;
  }
}
