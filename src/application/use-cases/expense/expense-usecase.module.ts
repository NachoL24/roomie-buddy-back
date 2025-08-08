import { Module } from '@nestjs/common';
import { ExpenseUseCase } from './expense.use_case';
import { PersonalExpenseUseCase } from './personal-expense.use_case';
import { ExpenseRepositoryModule } from 'src/infrastructure/database/repositories/expense-repository.module';
import { ExpenseShareRepositoryModule } from 'src/infrastructure/database/repositories/expense-share-repository.module';
import { RoomieHouseRepositoryModule } from 'src/infrastructure/database/repositories/roomie-house-repository.module';
import { RoomieRepositoryModule } from 'src/infrastructure/database/repositories/roomie-repository.module';
import { IncomeRepositoryModule } from 'src/infrastructure/database/repositories/income-repository.module';
import { PersonalFinanceSyncService } from 'src/application/services/personal-finance-sync.service';

@Module({
    imports: [
        ExpenseRepositoryModule,
        ExpenseShareRepositoryModule,
        RoomieHouseRepositoryModule,
        RoomieRepositoryModule,
        IncomeRepositoryModule
    ],
    providers: [
        ExpenseUseCase,
        PersonalExpenseUseCase,
        PersonalFinanceSyncService
    ],
    exports: [
        ExpenseUseCase,
        PersonalExpenseUseCase,
        PersonalFinanceSyncService
    ]
})
export class ExpenseUseCaseModule { }
