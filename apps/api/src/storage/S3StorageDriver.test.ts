import { Readable } from 'stream';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

const getSignedUrlMock = vi.fn();

vi.mock('../config/env.js', () => ({
  env: {
    S3_BUCKET: 'test-bucket',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY_ID: 'key',
    S3_SECRET_ACCESS_KEY: 'secret',
    STORAGE_DRIVER: 's3',
  },
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: getSignedUrlMock,
}));

describe('S3StorageDriver', () => {
  let driver: import('./S3StorageDriver.js').S3StorageDriver;
  const s3Mock = mockClient(S3Client);

  beforeEach(async () => {
    vi.resetModules();
    s3Mock.reset();
    getSignedUrlMock.mockReset();
    const module = await import('./S3StorageDriver.js');
    driver = new module.S3StorageDriver();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uploads objects and returns a public url', async () => {
    s3Mock.on(PutObjectCommand).resolves({});

    const result = await driver.putObject({
      key: 'fonts/test.ttf',
      body: Buffer.from('data'),
      contentType: 'font/ttf',
    });

    expect(result).toEqual({
      key: 'fonts/test.ttf',
      url: 'https://test-bucket.s3.us-east-1.amazonaws.com/fonts/test.ttf',
    });
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: 'test-bucket',
      Key: 'fonts/test.ttf',
      ContentType: 'font/ttf',
    });
  });

  it('retrieves object streams', async () => {
    const body = Readable.from('payload');
    s3Mock.on(GetObjectCommand).resolves({ Body: body });

    const stream = await driver.getObjectStream('fonts/test.ttf');
    expect(stream).toBe(body);
  });

  it('throws when S3 does not return a body', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: undefined });

    await expect(driver.getObjectStream('missing')).rejects.toThrow('Unable to read S3 object');
  });

  it('deletes objects', async () => {
    s3Mock.on(DeleteObjectCommand).resolves({});

    await driver.deleteObject('fonts/test.ttf');
    expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: 'test-bucket',
      Key: 'fonts/test.ttf',
    });
  });

  it('creates signed urls', async () => {
    getSignedUrlMock.mockResolvedValue('signed-url');

    const url = await driver.getSignedUrl('fonts/test.ttf', 120);
    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
    expect(url).toBe('signed-url');
  });
});
