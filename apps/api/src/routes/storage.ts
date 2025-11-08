import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { prisma } from '../config/prisma.js';
import { getStorageDriver } from '../storage/index.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/previews/:fontId', asyncHandler(async (req, res, next) => {
  const preview = await prisma.preview.findFirst({ where: { fontId: req.params.fontId } });
  if (!preview) {
    throw new HttpError(404, 'Preview not found');
  }

  const storage = getStorageDriver();
  const stream = await storage.getObjectStream(preview.storageKey);
  res.setHeader('Content-Type', 'image/png');
  stream.on('error', next);
  stream.pipe(res);
}));

export const storageRouter = router;
