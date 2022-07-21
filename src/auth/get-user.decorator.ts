import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/User';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.swichToHttp().getRequest();
    return req.user;
  },
);
