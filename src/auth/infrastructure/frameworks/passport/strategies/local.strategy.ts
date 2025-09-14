import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
    ValidateUserCredentialsUseCase
} from "../../../../../users/application/use-cases/validate-user-credentials.use-case";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private validateUserUC: ValidateUserCredentialsUseCase) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.validateUserUC.execute(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
