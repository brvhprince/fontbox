import { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginUser, refreshSession, registerUser, revokeSession, sessionCookies } from '../services/authService.js';
import { HttpError } from '../middleware/errorHandler.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional(),
});

export const register = async (req: Request, res: Response) => {
  const body = credentialsSchema.parse(req.body);
  const session = await registerUser(body.email, body.password, body.displayName);
  for (const [name, cookie] of Object.entries(session.cookies)) {
    res.cookie(name, cookie.value, cookie.options);
  }
  res.status(201).json({ user: sanitizeUser(session.user), accessToken: session.accessToken });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = credentialsSchema.omit({ displayName: true }).parse(req.body);
  const session = await loginUser(email, password);
  for (const [name, cookie] of Object.entries(session.cookies)) {
    res.cookie(name, cookie.value, cookie.options);
  }
  res.json({ user: sanitizeUser(session.user), accessToken: session.accessToken });
};

export const me = [authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    throw new HttpError(401, 'Unauthenticated');
  }
  res.json({ user: sanitizeUser(req.user) });
}] as const;

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;
  if (!token) {
    throw new HttpError(401, 'Refresh token missing');
  }
  const session = await refreshSession(token);
  for (const [name, cookie] of Object.entries(session.cookies)) {
    res.cookie(name, cookie.value, cookie.options);
  }
  res.json({ user: sanitizeUser(session.user), accessToken: session.accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
  await revokeSession(token);
  const cleared = sessionCookies.clear();
  for (const [name, cookie] of Object.entries(cleared)) {
    res.cookie(name, cookie.value, cookie.options);
  }
  res.status(204).end();
};

function sanitizeUser<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash, ...rest } = user as any;
  return rest;
}
