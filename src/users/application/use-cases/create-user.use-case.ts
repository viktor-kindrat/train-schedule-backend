import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
  SafeUserDTO,
} from '../../domain/repositories/users.repository';
import {Role, UserAggregate} from '../../domain/aggregates/user.aggregate';
import { toSafeDTO } from '../mappers/user.mapper';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../domain/ports/password-hasher';
import { EmailAlreadyTakenError } from '../../domain/errors/user.errors';

export type CreateUserInput = {
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role?: Role;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly repo: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<SafeUserDTO> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) throw new EmailAlreadyTakenError(input.email);

    const { hash, salt } = this.hasher.hash(input.password);

    const aggregate = UserAggregate.createNew({
      id: 0,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role ?? Role.user,
      secret: { hash, salt },
      createdAt: new Date(),
    });

    const saved = await this.repo.save(aggregate);
    return toSafeDTO(saved);
  }
}
