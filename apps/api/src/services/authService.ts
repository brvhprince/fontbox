import { randomUUID } from 'crypto';
import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { sha256 } from '../utils/hash.js';
import { HttpError } from '../middleware/errorHandler.js';

function cookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE ?? env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    domain: env.COOKIE_DOMAIN || undefined,
    expires,
  };
}

export const sessionCookies = {
  build(accessToken: string, refreshToken: string, refreshExpiresAt: Date) {
    return {
      [env.SESSION_COOKIE_NAME]: {
        value: accessToken,
        options: cookieOptions(),
      },
      [env.REFRESH_COOKIE_NAME]: {
        value: refreshToken,
        options: cookieOptions(refreshExpiresAt),
      },
    } as const;
  },
  clear() {
    return {
      [env.SESSION_COOKIE_NAME]: {
        value: '',
        options: { ...cookieOptions(new Date(0)), maxAge: 0 },
      },
      [env.REFRESH_COOKIE_NAME]: {
        value: '',
        options: { ...cookieOptions(new Date(0)), maxAge: 0 },
      },
    } as const;
  },
};

export async function registerUser(email: string, password: string, displayName?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
    },
  });

  return createSession(user.id, null);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  return createSession(user.id, null);
}

async function storeRefreshToken(userId: string, token: string, rotatedFrom: string | null) {
  const decoded = verifyRefreshToken(token);
  const expiresAt = new Date(decoded.exp! * 1000);
  return prisma.refreshToken.create({
    data: {
      token: sha256(Buffer.from(token)),
      userId,
      rotatedFrom: rotatedFrom ?? decoded.rotation?.previous ?? null,
      expiresAt,
    },
  });
}

async function revokeRefreshToken(hashedToken: string) {
  await prisma.refreshToken.updateMany({
    where: {
      token: hashedToken,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function createSession(userId: string, rotatedFrom: string | null) {
  const jti = randomUUID();
  const refreshJti = randomUUID();

  const accessToken = signAccessToken({ sub: userId, jti });
  const refreshToken = signRefreshToken({ sub: userId, jti: refreshJti, rotation: { previous: rotatedFrom } });

  await storeRefreshToken(userId, refreshToken, rotatedFrom);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp! * 1000);

  return {
    accessToken,
    refreshToken,
    user,
    cookies: sessionCookies.build(accessToken, refreshToken, expiresAt),
  };
}

export async function refreshSession(refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);
  const hashed = sha256(Buffer.from(refreshToken));

  const stored = await prisma.refreshToken.findUnique({ where: { token: hashed } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new HttpError(401, 'Invalid refresh token');
  }

  await revokeRefreshToken(hashed);
  const session = await createSession(decoded.sub, stored.id);

  return session;
}

export async function revokeSession(refreshToken: string | undefined) {
  if (!refreshToken) return;
  try {
    const hashed = sha256(Buffer.from(refreshToken));
    await revokeRefreshToken(hashed);
  } catch (error) {
    // ignore invalid token during logout
  }
}
