import { Router } from 'express';
import { authRouter } from './auth.js';
import { fontsRouter } from './fonts.js';
import { tagsRouter } from './tags.js';
import { categoriesRouter } from './categories.js';
import { projectsRouter } from './projects.js';
import { searchRouter } from './search.js';
import { healthRouter } from './health.js';
import { storageRouter } from './storage.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/fonts', fontsRouter);
router.use('/tags', tagsRouter);
router.use('/categories', categoriesRouter);
router.use('/projects', projectsRouter);
router.use('/search', searchRouter);
router.use('/health', healthRouter);
router.use('/storage', storageRouter);
