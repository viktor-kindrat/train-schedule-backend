import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import {SafeUserDTO} from "../../../../../users/domain/repositories/users.repository";
import {FindUserByIdUseCase} from "../../../../../users/application/use-cases/find-user-by-id.use-case";

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

function cookieExtractor(req: Request): string | null {
  const cookieName = 'auth-token';
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith(cookieName + '=')) {
      return decodeURIComponent(c.substring(cookieName.length + 1));
    }
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly findUserById: FindUserByIdUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUserDTO | null> {
    const user = await this.findUserById.execute(payload.sub);
    return user ?? null;
  }
}
