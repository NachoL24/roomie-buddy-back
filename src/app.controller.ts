import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Request() req: any): any {
    return {
      message: this.appService.getHello()
    };
  }

  @Get("user")
  @UseGuards(AuthGuard('jwt'))
  getUser(@Request() req: any): any {
    return {
      user: req.user
    };
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
