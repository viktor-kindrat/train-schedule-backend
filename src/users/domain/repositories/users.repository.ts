import { UserAggregate, UserSnapshot } from '../aggregates/user.aggregate';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UsersRepository {
  findByEmail(email: string): Promise<UserAggregate | null>;
  findById(id: number): Promise<UserAggregate | null>;
  list(): Promise<UserAggregate[]>;
  save(user: UserAggregate): Promise<UserAggregate>;
  updateLastLogin(id: number, at: Date): Promise<void>;
}

export type SafeUserDTO = Omit<UserSnapshot, 'passwordHash' | 'passwordSalt'>;
