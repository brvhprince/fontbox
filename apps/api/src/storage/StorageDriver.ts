export interface StoredObject {
  key: string;
  url?: string;
}

export interface StorageDriver {
  putObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
    cacheControl?: string;
  }): Promise<StoredObject>;
  getObjectStream(key: string): Promise<NodeJS.ReadableStream>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl?(key: string): string | undefined;
}
