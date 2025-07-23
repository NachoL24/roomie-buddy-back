import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './adapters/inbound/http/auth/auth.module';
import { Auth0UserinfoModule } from './adapters/outbound/auth0/auth0-userInfo.module';
import { Auth0ManagementApiModule } from './adapters/outbound/auth0/auth0-managementapi.module';

@Module({
  imports: [AuthModule, Auth0UserinfoModule, Auth0ManagementApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }