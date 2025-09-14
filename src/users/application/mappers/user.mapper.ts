import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { SafeUserDTO } from '../../domain/repositories/users.repository';

export function toSafeDTO(user: UserAggregate): SafeUserDTO {
  const s = user.snapshot();
  const {
    passwordHash: _passwordHash,
    passwordSalt: _passwordSalt,
    ...rest
  } = s;
  const safe: SafeUserDTO = { ...rest };
  return safe;
}
