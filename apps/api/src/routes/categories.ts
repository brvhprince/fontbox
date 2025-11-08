import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../services/categoryService.js';

const router = Router();
const bodySchema = z.object({ name: z.string().min(1) });

router.get('/', asyncHandler(async (_req, res) => {
  const categories = await listCategories();
  res.json(categories);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name } = bodySchema.parse(req.body);
  const category = await createCategory(name);
  res.status(201).json(category);
}));

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { name } = bodySchema.parse(req.body);
  const category = await updateCategory(req.params.id, name);
  res.json(category);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id);
  res.status(204).end();
}));

export const categoriesRouter = router;
