import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import { search } from '../services/searchService.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { term } = z
    .object({ term: z.preprocess((value) => (Array.isArray(value) ? value[0] : value), z.string().min(1)) })
    .parse(req.query);
  const results = await search(term);
  res.json(results);
}));

export const searchRouter = router;
