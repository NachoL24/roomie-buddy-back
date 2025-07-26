import { Controller, Get, UseGuards, Request, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Auth0ManagementApiAdapter } from 'src/infrastructure/external-services/auth0/auth0-managementapi.adapter';
import { Auth0UserinfoAdapter } from 'src/infrastructure/external-services/auth0/auth0-userInfo.adapter';
import { User } from '../decorators/user.decorator';
import { AuthenticatedUserDto } from '../../application/dto/user/authenticated-user.dto';
import { UserUseCase } from 'src/application/use-cases/user/user.use_case';

@Controller("user")
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(
        // private readonly userService: UserService,
        private readonly auth0UserinfoAdapter: Auth0UserinfoAdapter,
        private readonly auth0ManagementApiAdapter: Auth0ManagementApiAdapter,
        private readonly userUseCase: UserUseCase
    ) { }

    @Get()
    getUserOrCreateUser(@User() user: AuthenticatedUserDto): any {
        console.log("UserController - getUserOrCreateUser called with user:", user);
        return this.userUseCase.getUserOrCreateUser(user);
    }

    @Get("user-info")
    @UseGuards(AuthGuard('jwt'))
    getUserInfo(@User() user: AuthenticatedUserDto, @Request() req: any): any {
        if (!user) {
            return { message: 'No user authenticated' };
        }
        const token = req.headers.authorization?.split(' ')[1];
        return this.auth0UserinfoAdapter.fetchProfile(token);
    }

    @Get('user-metadata')
    @UseGuards(AuthGuard('jwt'))
    async getUserMetadata(@User() user: AuthenticatedUserDto): Promise<any> {
        if (!user) {
            return { message: 'No user authenticated' };
        }
        try {
            const metadata = await this.auth0ManagementApiAdapter.getUserMetadata(user.sub);
            return { user: user, metadata };
        } catch (error) {
            return { message: 'Error fetching user metadata', error: error.message };
        }
    }

    @Post('complete-profile')
    @UseGuards(AuthGuard('jwt'))
    async completeProfile(@User() user: AuthenticatedUserDto): Promise<any> {
        if (!user) {
            return { message: 'No user authenticated' };
        }

        try {
            // Verificar el estado actual desde Auth0, no del token
            const currentMetadata = await this.auth0ManagementApiAdapter.getUserMetadata(user.sub);

            if (currentMetadata.profile_complete === true) {
                return { message: 'Profile already completed', metadata: currentMetadata };
            }

            await this.auth0ManagementApiAdapter.updateUserMetadata(user.sub, { profile_complete: true });

            return {
                message: 'Profile completed successfully',
                metadata: { profile_complete: true }
            };
        } catch (error) {
            return { message: 'Error updating profile', error: error.message };
        }
    }

    @Post('uncomplete-profile')
    @UseGuards(AuthGuard('jwt'))
    async uncompleteProfile(@User() user: AuthenticatedUserDto): Promise<any> {
        if (!user) {
            return { message: 'No user authenticated' };
        }

        try {
            // Verificar el estado actual desde Auth0, no del token
            const currentMetadata = await this.auth0ManagementApiAdapter.getUserMetadata(user.sub);

            if (currentMetadata.profile_complete === false || currentMetadata.profile_complete === undefined) {
                return { message: 'Profile already uncompleted', metadata: currentMetadata };
            }

            await this.auth0ManagementApiAdapter.updateUserMetadata(user.sub, { profile_complete: false });

            return {
                message: 'Profile uncompleted successfully',
                metadata: { profile_complete: false }
            };
        } catch (error) {
            return { message: 'Error updating profile', error: error.message };
        }
    }
}
