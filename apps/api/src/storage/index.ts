import { env } from '../config/env.js';
import { LocalStorageDriver } from './LocalStorageDriver.js';
import { S3StorageDriver } from './S3StorageDriver.js';
import { StorageDriver } from './StorageDriver.js';

let driver: StorageDriver | null = null;

export function getStorageDriver(): StorageDriver {
  if (driver) return driver;

  if (env.STORAGE_DRIVER === 's3') {
    driver = new S3StorageDriver();
  } else {
    driver = new LocalStorageDriver();
  }

  return driver;
}
