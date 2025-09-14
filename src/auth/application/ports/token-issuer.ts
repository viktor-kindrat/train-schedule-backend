import type { SafeUserDTO } from '../../../users/domain/repositories/users.repository';

export interface TokenIssuer {
  signForUser(user: SafeUserDTO): string;
}

export const TOKEN_ISSUER = 'TOKEN_ISSUER';
