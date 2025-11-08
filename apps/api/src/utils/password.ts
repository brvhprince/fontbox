import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
