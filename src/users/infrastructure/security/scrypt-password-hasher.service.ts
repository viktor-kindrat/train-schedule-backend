import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import {
  hashPassword,
  verifyPassword,
} from '../../../auth/utils/password.util';

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  hash(plain: string): { hash: string; salt: string } {
    return hashPassword(plain);
  }
  verify(plain: string, salt: string, hash: string): boolean {
    return verifyPassword(plain, salt, hash);
  }
}
