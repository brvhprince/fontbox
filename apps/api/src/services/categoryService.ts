import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { cacheKeys } from '../utils/cacheKeys.js';
import { slugify } from '../utils/slugify.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function listCategories() {
  try {
    const cached = await redis.get(cacheKeys.categoriesList);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    // ignore redis
  }

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  try {
    await redis.set(cacheKeys.categoriesList, JSON.stringify(categories), 'EX', 300);
  } catch (error) {
    // ignore
  }

  return categories;
}

export async function createCategory(name: string) {
  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return existing;
  }
  const category = await prisma.category.create({ data: { name, slug } });
  await invalidate();
  return category;
}

export async function updateCategory(id: string, name: string) {
  const slug = slugify(name);
  const category = await prisma.category.update({ where: { id }, data: { name, slug } });
  await invalidate();
  return category;
}

export async function deleteCategory(id: string) {
  const fonts = await prisma.font.count({ where: { categoryId: id } });
  if (fonts > 0) {
    throw new HttpError(400, 'Cannot delete category with associated fonts');
  }
  await prisma.category.delete({ where: { id } });
  await invalidate();
}

async function invalidate() {
  try {
    await redis.del(cacheKeys.categoriesList);
  } catch (error) {
    // ignore
  }
}
