import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(
  password: string,
  salt?: string,
): { hash: string; salt: string } {
  const usedSalt = salt || randomBytes(16).toString('hex');
  const hash = scryptSync(password, usedSalt, 64).toString('hex');
  return { hash, salt: usedSalt };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): boolean {
  const hash = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  return timingSafeEqual(hash, expected);
}
