import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './presentation/guards/auth.module';
import { Auth0UserinfoModule } from './infrastructure/external-services/auth0/auth0-userInfo.module';
import { Auth0ManagementApiModule } from './infrastructure/external-services/auth0/auth0-managementapi.module';
import { DatabaseConnectionModule } from './infrastructure/database/database-conection.module';

@Module({
  imports: [
    AuthModule,
    Auth0UserinfoModule,
    Auth0ManagementApiModule,
    DatabaseConnectionModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }