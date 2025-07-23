import { Controller, Get, UseGuards, Request, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Auth0UserinfoAdapter } from './adapters/outbound/auth0/auth0-userInfo.adapter';
import { Auth0ManagementApiAdapter } from './adapters/outbound/auth0/auth0-managementapi.adapter';
import { ProfileCompletedGuard } from './adapters/inbound/http/auth/profile-completed.guard';

@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly auth0UserinfoAdapter: Auth0UserinfoAdapter, private readonly auth0ManagementApiAdapter: Auth0ManagementApiAdapter) { }

  @Get()
  getHello(@Request() req: any): any {
    return {
      message: this.appService.getHello()
    };
  }

  @Get("user")
  @UseGuards(AuthGuard('jwt'))
  getUser(@Request() req: any): any {
    if (!req.user) {
      return { message: 'No user authenticated' };
    }
    return {
      user: req.user,
      message: 'User information retrieved successfully'
    };
  }

  @Get("user-info")
  @UseGuards(AuthGuard('jwt'))
  getUserInfo(@Request() req: any): any {
    if (!req.user) {
      return { message: 'No user authenticated' };
    }
    const token = req.headers.authorization?.split(' ')[1];
    return this.auth0UserinfoAdapter.fetchProfile(token);
  }

  @Get('user-metadata')
  @UseGuards(AuthGuard('jwt'))
  async getUserMetadata(@Request() req: any): Promise<any> {
    if (!req.user) {
      return { message: 'No user authenticated' };
    }
    try {
      const metadata = await this.auth0ManagementApiAdapter.getUserMetadata(req.user.sub);
      return { user: req.user, metadata };
    } catch (error) {
      return { message: 'Error fetching user metadata', error: error.message };
    }
  }

  @Post('complete-profile')
  @UseGuards(AuthGuard('jwt'))
  async completeProfile(@Request() req: any): Promise<any> {
    if (!req.user) {
      return { message: 'No user authenticated' };
    }

    try {
      // Verificar el estado actual desde Auth0, no del token
      const currentMetadata = await this.auth0ManagementApiAdapter.getUserMetadata(req.user.sub);

      if (currentMetadata.profile_complete === true) {
        return { message: 'Profile already completed', metadata: currentMetadata };
      }

      await this.auth0ManagementApiAdapter.updateUserMetadata(req.user.sub, { profile_complete: true });

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
  async uncompleteProfile(@Request() req: any): Promise<any> {
    if (!req.user) {
      return { message: 'No user authenticated' };
    }

    try {
      // Verificar el estado actual desde Auth0, no del token
      const currentMetadata = await this.auth0ManagementApiAdapter.getUserMetadata(req.user.sub);

      if (currentMetadata.profile_complete === false || currentMetadata.profile_complete === undefined) {
        return { message: 'Profile already uncompleted', metadata: currentMetadata };
      }

      await this.auth0ManagementApiAdapter.updateUserMetadata(req.user.sub, { profile_complete: false });

      return {
        message: 'Profile uncompleted successfully',
        metadata: { profile_complete: false }
      };
    } catch (error) {
      return { message: 'Error updating profile', error: error.message };
    }
  }

  @Get('public')
  getPublic(): string {
    return 'This is a public endpoint - no authentication required';
  }

  @Get('test-env')
  testEnv(): any {
    return {
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE,
      jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    };
  }
}
