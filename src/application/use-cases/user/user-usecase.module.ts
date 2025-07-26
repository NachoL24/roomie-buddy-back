import { Module } from '@nestjs/common';
import { UserUseCase } from './user.use_case';
import { RepositoriesModule } from '../../../infrastructure/database/repositories/repositories.module';
import { Auth0UserinfoModule } from '../../../infrastructure/external-services/auth0/auth0-userInfo.module';
import { Auth0ManagementApiModule } from 'src/infrastructure/external-services/auth0/auth0-managementapi.module';

@Module({
    imports: [
        RepositoriesModule,
        Auth0UserinfoModule,
        Auth0ManagementApiModule
    ],
    providers: [UserUseCase],
    exports: [UserUseCase],
})
export class UserUseCaseModule { }
