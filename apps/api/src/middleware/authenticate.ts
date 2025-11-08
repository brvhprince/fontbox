import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from './errorHandler.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.[env.SESSION_COOKIE_NAME] ||
      req.headers.authorization?.replace('Bearer ', '') ||
      undefined;

    if (!token) {
      throw new HttpError(401, 'Authentication required');
    }

    const payload = verifyAccessToken(token);
    req.accessTokenId = payload.jti;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new HttpError(401, 'Invalid authentication');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new HttpError(401, 'Authentication required'));
  }
}
