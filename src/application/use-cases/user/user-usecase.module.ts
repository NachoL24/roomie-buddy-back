import { Module } from '@nestjs/common';
import { UserUseCase } from './user.use_case';
import { RepositoriesModule } from '../../../infrastructure/database/repositories/repositories.module';
import { Auth0UserinfoModule } from '../../../infrastructure/external-services/auth0/auth0-userInfo.module';

@Module({
    imports: [
        RepositoriesModule,
        Auth0UserinfoModule
    ],
    providers: [UserUseCase],
    exports: [UserUseCase],
})
export class UserUseCaseModule { }
