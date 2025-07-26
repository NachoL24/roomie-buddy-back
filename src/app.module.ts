import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './presentation/guards/auth.module';
import { Auth0UserinfoModule } from './infrastructure/external-services/auth0/auth0-userInfo.module';
import { Auth0ManagementApiModule } from './infrastructure/external-services/auth0/auth0-managementapi.module';
import { DatabaseConnectionModule } from './infrastructure/database/database-conection.module';
import { RepositoriesModule } from './infrastructure/database/repositories';
import { UserController } from './presentation/controllers/user.controller';
import { UseCasesModule } from './application/use-cases/use-cases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    Auth0UserinfoModule,
    Auth0ManagementApiModule,
    DatabaseConnectionModule.forRoot(),
    RepositoriesModule,
    UseCasesModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule { }