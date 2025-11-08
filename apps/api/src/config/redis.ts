import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
});

export async function checkRedisConnection() {
  await redis.ping();
}
