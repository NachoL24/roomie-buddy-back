import { Module } from '@nestjs/common';
import { ExpenseUseCase } from './expense.use_case';
import { ExpenseRepositoryModule } from 'src/infrastructure/database/repositories/expense-repository.module';
import { ExpenseShareRepositoryModule } from 'src/infrastructure/database/repositories/expense-share-repository.module';
import { RoomieHouseRepositoryModule } from 'src/infrastructure/database/repositories/roomie-house-repository.module';

@Module({
    imports: [
        ExpenseRepositoryModule,
        ExpenseShareRepositoryModule,
        RoomieHouseRepositoryModule
    ],
    providers: [ExpenseUseCase],
    exports: [ExpenseUseCase]
})
export class ExpenseUseCaseModule { }
