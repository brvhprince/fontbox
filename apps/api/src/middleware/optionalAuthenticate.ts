import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.[env.SESSION_COOKIE_NAME] ||
      req.headers.authorization?.replace('Bearer ', '') ||
      undefined;

    if (!token) {
      return next();
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user) {
      req.user = user;
      req.accessTokenId = payload.jti;
    }
  } catch (error) {
    // ignore invalid tokens for optional auth
  }

  next();
}
