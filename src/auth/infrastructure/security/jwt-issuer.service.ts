import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SafeUserDTO } from '../../../users/domain/repositories/users.repository';
import { TokenIssuer } from '../../application/ports/token-issuer';

@Injectable()
export class JwtIssuerService implements TokenIssuer {
  constructor(private readonly jwtService: JwtService) {}

  signForUser(user: SafeUserDTO): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
