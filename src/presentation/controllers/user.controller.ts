import { Controller, Get, UseGuards, Request, Post, Put, Body, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Auth0ManagementApiAdapter } from 'src/infrastructure/external-services/auth0/auth0-managementapi.adapter';
import { Auth0UserinfoAdapter } from 'src/infrastructure/external-services/auth0/auth0-userInfo.adapter';
import { User } from '../decorators/user.decorator';
import { AuthenticatedUserDto } from '../../application/dto/user/authenticated-user.dto';
import { UserUseCase } from 'src/application/use-cases/user/user.use_case';
import { RoomieUpdateDto } from '../dtos/roomie_update.request.dto';

@Controller("user")
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(
        private readonly auth0UserinfoAdapter: Auth0UserinfoAdapter,
        private readonly auth0ManagementApiAdapter: Auth0ManagementApiAdapter,
        private readonly userUseCase: UserUseCase
    ) { }

    @Get()
    getUserOrCreateUser(@User() user: AuthenticatedUserDto): any {
        console.log("UserController - getUserOrCreateUser called with user:", user);
        return this.userUseCase.getUserOrCreateUser(user);
    }

    @Put(':id')
    async updateUser(@User() user: AuthenticatedUserDto, @Body() dto: RoomieUpdateDto, @Param('id') id: number): Promise<any> {
        console.log("UserController - updateUser called for userId:", id, "with data:", dto);
        return this.userUseCase.updateUser(user, dto, id);
    }
}
