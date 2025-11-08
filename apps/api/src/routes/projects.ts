import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { createProject, deleteProject, listProjects, updateProject } from '../services/projectService.js';

const router = Router();
const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const projects = await listProjects(req.user!.id);
  res.json(projects);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const body = bodySchema.parse(req.body);
  const project = await createProject(req.user!.id, body.name, body.description);
  res.status(201).json(project);
}));

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const body = bodySchema.partial().parse(req.body);
  const project = await updateProject(req.params.id, req.user!.id, body);
  res.json(project);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await deleteProject(req.params.id, req.user!.id);
  res.status(204).end();
}));

export const projectsRouter = router;
