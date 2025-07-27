import { Module } from '@nestjs/common';
import { InvitationUseCase } from './invitation.use_case';
import { RepositoriesModule } from 'src/infrastructure/database/repositories';

@Module({
    imports: [
        RepositoriesModule,
    ],
    providers: [InvitationUseCase],
    exports: [InvitationUseCase],
})
export class InvitationUseCaseModule { }
