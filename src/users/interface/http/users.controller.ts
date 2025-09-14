import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/interface/security/guards/jwt-auth.guard';
import { Roles } from '../../../auth/interface/security/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/interface/security/decorators/current-user.decorator';
import { RolesGuard } from '../../../auth/interface/security/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import type { SafeUserDTO } from '../../domain/repositories/users.repository';
import {
  EmailAlreadyTakenError,
  InvalidEmailError,
} from '../../domain/errors/user.errors';
import { Role } from '../../domain/aggregates/user.aggregate';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.user)
  @Get('me')
  me(
    @CurrentUser()
    user: SafeUserDTO,
  ) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get()
  findAll() {
    return this.listUsers.execute();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    try {
      return await this.createUser.execute(dto);
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
}
