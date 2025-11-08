import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { createOrGetTag, deleteTag, listTags, updateTag } from '../services/tagService.js';

const router = Router();
const bodySchema = z.object({ name: z.string().min(1) });

router.get('/', asyncHandler(async (_req, res) => {
  const tags = await listTags();
  res.json(tags);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name } = bodySchema.parse(req.body);
  const tag = await createOrGetTag(name);
  res.status(201).json(tag);
}));

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { name } = bodySchema.parse(req.body);
  const tag = await updateTag(req.params.id, name);
  res.json(tag);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await deleteTag(req.params.id);
  res.status(204).end();
}));

export const tagsRouter = router;
