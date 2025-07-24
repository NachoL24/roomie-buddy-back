import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Auth0UserinfoAdapter } from './auth0-userInfo.adapter';

@Global()
@Module({
  imports: [HttpModule],
  providers: [Auth0UserinfoAdapter],
  exports: [Auth0UserinfoAdapter],
})
export class Auth0UserinfoModule {}