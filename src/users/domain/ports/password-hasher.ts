export interface PasswordHasher {
  hash(plain: string): { hash: string; salt: string };
  verify(plain: string, salt: string, hash: string): boolean;
}

export const PASSWORD_HASHER = 'PASSWORD_HASHER';
