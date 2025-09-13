import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
  SafeUserDTO,
} from '../../domain/repositories/users.repository';
import { toSafeDTO } from '../mappers/user.mapper';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly repo: UsersRepository,
  ) {}

  async execute(): Promise<SafeUserDTO[]> {
    const users = await this.repo.list();
    return users.map((u) => toSafeDTO(u));
  }
}
