import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../../../interface/http/users.controller';
import { TypeOrmUsersRepository } from '../../persistence/typeorm/typeorm-users.repository';
import { USERS_REPOSITORY } from '../../../domain/repositories/users.repository';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case';
import { ValidateUserCredentialsUseCase } from '../../../application/use-cases/validate-user-credentials.use-case';
import { FindUserByIdUseCase } from '../../../application/use-cases/find-user-by-id.use-case';
import { UpdateLastLoginUseCase } from '../../../application/use-cases/update-last-login.use-case';
import { PASSWORD_HASHER } from '../../../domain/ports/password-hasher';
import { ScryptPasswordHasher } from '../../security/scrypt-password-hasher.service';
import { User } from '../../persistence/typeorm/user.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    { provide: USERS_REPOSITORY, useClass: TypeOrmUsersRepository },
    { provide: PASSWORD_HASHER, useClass: ScryptPasswordHasher },
    CreateUserUseCase,
    ListUsersUseCase,
    ValidateUserCredentialsUseCase,
    FindUserByIdUseCase,
    UpdateLastLoginUseCase,
  ],
  controllers: [UsersController],
  exports: [
    TypeOrmModule,
    USERS_REPOSITORY,
    PASSWORD_HASHER,
    CreateUserUseCase,
    ListUsersUseCase,
    ValidateUserCredentialsUseCase,
    FindUserByIdUseCase,
    UpdateLastLoginUseCase,
  ],
})
export class UsersModule {}
