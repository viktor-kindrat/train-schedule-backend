import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';
import type { SafeUserDTO } from '../../../users/domain/repositories/users.repository';
import {
  EmailAlreadyTakenError,
  InvalidEmailError,
} from '../../../users/domain/errors/user.errors';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { CurrentUser } from '../security/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  private getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = process.env.JWT_COOKIE_MAX_AGE
      ? Number(process.env.JWT_COOKIE_MAX_AGE)
      : 7 * 24 * 60 * 60 * 1000;
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge,
      path: '/',
    } as const;
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    try {
      const user = await this.createUser.execute({
        lastName: dto.lastName,
        firstName: dto.firstName,
        email: dto.email,
        password: dto.password,
      });
      return { message: 'Registered', user };
    } catch (e) {
      if (e instanceof EmailAlreadyTakenError) {
        throw new ConflictException(e.message);
      }
      if (e instanceof InvalidEmailError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
    res.cookie('auth-token', result.token, this.getCookieOptions());
    return { message: 'Logged in', user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(
    @CurrentUser()
    user: SafeUserDTO,
  ) {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth-token', this.getCookieOptions());
    return { message: 'Logged out' };
  }
}
