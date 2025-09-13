import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
} from '../../domain/repositories/users.repository';

@Injectable()
export class UpdateLastLoginUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly repo: UsersRepository,
  ) {}

  async execute(id: number, at: Date = new Date()): Promise<void> {
    await this.repo.updateLastLogin(id, at);
  }
}
