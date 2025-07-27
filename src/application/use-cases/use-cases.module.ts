import { Module } from '@nestjs/common';
import { UserUseCaseModule } from './user/user-usecase.module';
import { HouseUseCaseModule } from './house/house-usecase.module';
import { InvitationUseCaseModule } from './invitation/invitation-usecase.module';
import { ExpenseUseCaseModule } from './expense/expense-usecase.module';
import { SettlementUseCaseModule } from './settlement/settlement-usecase.module';

@Module({
    imports: [UserUseCaseModule, HouseUseCaseModule, InvitationUseCaseModule, ExpenseUseCaseModule, SettlementUseCaseModule],
    exports: [UserUseCaseModule, HouseUseCaseModule, InvitationUseCaseModule, ExpenseUseCaseModule, SettlementUseCaseModule],
})
export class UseCasesModule { }
