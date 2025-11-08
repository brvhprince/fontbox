import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkDatabaseConnection } from '../config/prisma.js';
import { checkRedisConnection } from '../config/redis.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const status = {
    database: false,
    redis: false,
  };

  try {
    await checkDatabaseConnection();
    status.database = true;
  } catch (error) {
    status.database = false;
  }

  try {
    await checkRedisConnection();
    status.redis = true;
  } catch (error) {
    status.redis = false;
  }

  const healthy = status.database && status.redis;
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', services: status });
}));

export const healthRouter = router;
