import { prisma } from '../config/prisma.js';
import { slugify } from '../utils/slugify.js';

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@fontbox.dev' },
    create: {
      email: 'demo@fontbox.dev',
      passwordHash: '$2a$10$1o6YJ8GqOTXnK4KzHd7oquIUt/9P1dCV.LoVi//3yZp2KcN8kXicm',
      displayName: 'Demo User',
    },
    update: {},
  });

  const categories = ['Sans Serif', 'Serif', 'Display'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name) },
      update: { name },
    });
  }

  const tags = ['Modern', 'Classic', 'Handwritten'];
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name) },
      update: { name },
    });
  }

  await prisma.project.upsert({
    where: { slug: 'demo-project' },
    create: { name: 'Demo Project', slug: 'demo-project', userId: user.id },
    update: { name: 'Demo Project' },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
