import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  deleteFont,
  getDuplicateByHash,
  getFontById,
  getFontStream,
  listFonts,
  updateFont,
  uploadFont,
} from '../services/fontService.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const listQuerySchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  search: z.string().optional(),
  tagIds: z
    .preprocess((value) => {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
      return [];
    }, z.array(z.string()))
    .optional(),
  categoryId: z.string().optional(),
  projectId: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z
    .preprocess((value) => (value === 'null' || value === '' ? null : value), z.string().nullable())
    .optional(),
  projectId: z
    .preprocess((value) => (value === 'null' || value === '' ? null : value), z.string().nullable())
    .optional(),
  tags: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch (error) {
          return value.split(',').map((item) => item.trim()).filter(Boolean);
        }
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
      return undefined;
    }, z.array(z.string()).optional())
    .optional(),
});

const router = Router();

router.get('/', optionalAuthenticate, asyncHandler(async (req, res) => {
  const filters = listQuerySchema.parse(req.query);
  const result = await listFonts(filters);
  res.json(result);
}));

router.get('/duplicates/:hash', optionalAuthenticate, asyncHandler(async (req, res) => {
  const font = await getDuplicateByHash(req.params.hash);
  res.json(font);
}));

router.get('/:id/download', optionalAuthenticate, asyncHandler(async (req, res, next) => {
  const { stream, font } = await getFontStream(req.params.id);
  res.setHeader('Content-Type', font.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${font.originalFileName}"`);
  stream.on('error', next);
  stream.pipe(res);
}));

router.get('/:id', optionalAuthenticate, asyncHandler(async (req, res) => {
  const font = await getFontById(req.params.id);
  res.json(font);
}));

router.post('/upload', authenticate, upload.single('font'), asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const result = await uploadFont(req.user!.id, req.file!, payload);
  res.status(result.duplicate ? 200 : 201).json(result);
}));

router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
  const payload = updateSchema.parse(req.body);
  const updated = await updateFont(req.params.id, payload);
  res.json(updated);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await deleteFont(req.params.id);
  res.status(204).end();
}));

export const fontsRouter = router;
