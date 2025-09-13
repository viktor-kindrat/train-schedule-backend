import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SafeUserDTO } from '../../../../users/domain/repositories/users.repository';

export const CurrentUser = createParamDecorator<SafeUserDTO | undefined>(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: SafeUserDTO }>();
    return request.user;
  },
);
