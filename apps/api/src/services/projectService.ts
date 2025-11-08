import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { cacheKeys } from '../utils/cacheKeys.js';
import { slugify } from '../utils/slugify.js';
import { HttpError } from '../middleware/errorHandler.js';

async function invalidate(userId: string) {
  try {
    await redis.del(cacheKeys.projectsList(userId));
  } catch (error) {
    // ignore
  }
}

export async function listProjects(userId: string) {
  try {
    const cached = await redis.get(cacheKeys.projectsList(userId));
    if (cached) return JSON.parse(cached);
  } catch (error) {
    // ignore
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  try {
    await redis.set(cacheKeys.projectsList(userId), JSON.stringify(projects), 'EX', 120);
  } catch (error) {
    // ignore
  }

  return projects;
}

export async function createProject(userId: string, name: string, description?: string) {
  const slug = slugify(name);
  const existing = await prisma.project.findFirst({ where: { slug, userId } });
  if (existing) {
    return existing;
  }
  const project = await prisma.project.create({ data: { name, slug, description, userId } });
  await invalidate(userId);
  return project;
}

export async function updateProject(id: string, userId: string, data: { name?: string; description?: string | null }) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId) {
    throw new HttpError(404, 'Project not found');
  }
  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: data.name ?? project.name,
      description: data.description ?? project.description,
      slug: data.name ? slugify(data.name) : project.slug,
    },
  });
  await invalidate(userId);
  return updated;
}

export async function deleteProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId) {
    throw new HttpError(404, 'Project not found');
  }
  const fonts = await prisma.font.count({ where: { projectId: id } });
  if (fonts > 0) {
    throw new HttpError(400, 'Cannot delete project with associated fonts');
  }
  await prisma.project.delete({ where: { id } });
  await invalidate(userId);
}
