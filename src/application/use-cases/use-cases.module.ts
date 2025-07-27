import { Module } from '@nestjs/common';
import { UserUseCaseModule } from './user/user-usecase.module';
import { HouseUseCaseModule } from './house/house-usecase.module';
import { InvitationUseCaseModule } from './invitation/invitation-usecase.module';

@Module({
    imports: [UserUseCaseModule, HouseUseCaseModule, InvitationUseCaseModule],
    exports: [UserUseCaseModule, HouseUseCaseModule, InvitationUseCaseModule],
})
export class UseCasesModule { }
