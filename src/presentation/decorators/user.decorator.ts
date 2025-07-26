import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserDto } from '../../application/dto/user/authenticated-user.dto';

export const User = createParamDecorator(
    (data: keyof AuthenticatedUserDto | undefined, ctx: ExecutionContext): AuthenticatedUserDto | any => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Si se especifica una propiedad específica, devolverla
        return data ? user?.[data] : user;
    },
);
