import { User } from './user.orm-entity';
import {
  UserAggregate,
  UserSnapshot,
} from '../../../domain/aggregates/user.aggregate';

export type UserRowWithOptionalSecrets = User &
  Partial<Pick<User, 'passwordHash' | 'passwordSalt'>>;

export function toDomain(row: UserRowWithOptionalSecrets): UserAggregate {
  const snapshot: UserSnapshot = {
    id: row.id,
    lastName: row.lastName,
    firstName: row.firstName,
    email: row.email,
    role: row.role,
    passwordHash: row.passwordHash ?? '',
    passwordSalt: row.passwordSalt ?? '',
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
  return UserAggregate.restore(snapshot);
}

export function toPersistence(snapshot: UserSnapshot): User {
  const row = new User();
  row.id = snapshot.id;
  row.lastName = snapshot.lastName;
  row.firstName = snapshot.firstName;
  row.email = snapshot.email;
  row.role = snapshot.role;
  row.passwordHash = snapshot.passwordHash;
  row.passwordSalt = snapshot.passwordSalt;
  row.lastLoginAt = snapshot.lastLoginAt
    ? new Date(snapshot.lastLoginAt)
    : null;
  row.createdAt = new Date(snapshot.createdAt);
  return row;
}
