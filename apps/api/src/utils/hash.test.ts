import { describe, it, expect } from 'vitest';
import { sha256 } from './hash.js';

describe('sha256', () => {
  it('produces deterministic hashes for identical buffers', () => {
    const buffer = Buffer.from('font-data');
    expect(sha256(buffer)).toBe(sha256(Buffer.from('font-data')));
  });

  it('produces distinct hashes for different buffers', () => {
    const left = sha256(Buffer.from('font-a'));
    const right = sha256(Buffer.from('font-b'));
    expect(left).not.toBe(right);
  });
});
