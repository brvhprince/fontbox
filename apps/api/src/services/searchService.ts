import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { cacheKeys } from '../utils/cacheKeys.js';

export async function search(term: string) {
  const key = cacheKeys.search(term.toLowerCase());
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    // ignore
  }

  const [fonts, tags, categories] = await Promise.all([
    prisma.font.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, slug: true, previewReady: true },
      take: 10,
    }),
    prisma.tag.findMany({
      where: { name: { contains: term, mode: 'insensitive' } },
      select: { id: true, name: true, slug: true },
      take: 10,
    }),
    prisma.category.findMany({
      where: { name: { contains: term, mode: 'insensitive' } },
      select: { id: true, name: true, slug: true },
      take: 10,
    }),
  ]);

  const result = { fonts, tags, categories };

  try {
    await redis.set(key, JSON.stringify(result), 'EX', 60);
  } catch (error) {
    // ignore
  }

  return result;
}
