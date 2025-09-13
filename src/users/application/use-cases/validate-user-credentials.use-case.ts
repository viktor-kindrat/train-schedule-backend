import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
  SafeUserDTO,
} from '../../domain/repositories/users.repository';
import { toSafeDTO } from '../mappers/user.mapper';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../domain/ports/password-hasher';

@Injectable()
export class ValidateUserCredentialsUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly repo: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(email: string, password: string): Promise<SafeUserDTO | null> {
    const user = await this.repo.findByEmail(email);
    if (!user) return null;
    const s = user.snapshot();
    const ok = this.hasher.verify(password, s.passwordSalt, s.passwordHash);
    if (!ok) return null;
    await this.repo.updateLastLogin(s.id, new Date());
    return toSafeDTO(user);
  }
}
