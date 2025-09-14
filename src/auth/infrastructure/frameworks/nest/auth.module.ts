import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../../../../users/infrastructure/frameworks/nest/users.module';
import { AuthController } from '../../../interface/http/auth.controller';
import { JwtStrategy } from '../passport/strategies/jwt.strategy';
import { LocalStrategy } from '../passport/strategies/local.strategy';
import { TOKEN_ISSUER } from '../../../application/ports/token-issuer';
import { JwtIssuerService } from '../../../infrastructure/security/jwt-issuer.service';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: TOKEN_ISSUER, useClass: JwtIssuerService },
    LoginUseCase,
    JwtStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
  exports: [TOKEN_ISSUER, LoginUseCase],
})
export class AuthModule {}
