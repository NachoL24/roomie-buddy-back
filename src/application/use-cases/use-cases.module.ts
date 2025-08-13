import { Module } from '@nestjs/common';
import { UserUseCaseModule } from './user/user-usecase.module';
import { HouseUseCaseModule } from './house/house-usecase.module';
import { InvitationUseCaseModule } from './invitation/invitation-usecase.module';
import { ExpenseUseCaseModule } from './expense/expense-usecase.module';
import { SettlementUseCaseModule } from './settlement/settlement-usecase.module';
import { IncomeUseCaseModule } from './income/income-usecase.module';
import { FinancialActivityUseCaseModule } from './financial-activity/financial-activity-usecase.module';
import { AvatarsModule } from './avatars/avatars.module';

@Module({
    imports: [UserUseCaseModule, HouseUseCaseModule, InvitationUseCaseModule, ExpenseUseCaseModule, SettlementUseCaseModule, IncomeUseCaseModule, FinancialActivityUseCaseModule, AvatarsModule],
    exports: [UserUseCaseModule, HouseUseCaseModule, InvitationUseCaseModule, ExpenseUseCaseModule, SettlementUseCaseModule, IncomeUseCaseModule, FinancialActivityUseCaseModule, AvatarsModule],
})
export class UseCasesModule { }
