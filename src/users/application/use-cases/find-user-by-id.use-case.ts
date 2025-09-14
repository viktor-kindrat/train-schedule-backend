import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
  SafeUserDTO,
} from '../../domain/repositories/users.repository';
import { toSafeDTO } from '../mappers/user.mapper';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly repo: UsersRepository,
  ) {}

  async execute(id: number): Promise<SafeUserDTO | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    return toSafeDTO(user);
  }
}
