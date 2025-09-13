import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  type UsersRepository,
  type SafeUserDTO,
} from '../../../users/domain/repositories/users.repository';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../../users/domain/ports/password-hasher';
import { TOKEN_ISSUER, type TokenIssuer } from '../ports/token-issuer';
import { toSafeDTO } from '../../../users/application/mappers/user.mapper';

export type LoginInput = { email: string; password: string };
export type LoginOutput = { user: SafeUserDTO; token: string };

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepo: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_ISSUER) private readonly issuer: TokenIssuer,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.usersRepo.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const snapshot = user.snapshot();
    const ok = this.hasher.verify(
      input.password,
      snapshot.passwordSalt,
      snapshot.passwordHash,
    );
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.usersRepo.updateLastLogin(snapshot.id, new Date());

    const safe = toSafeDTO(user);
    const token = this.issuer.signForUser(safe);
    return { user: safe, token };
  }
}
