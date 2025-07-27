import { Module } from '@nestjs/common';
import { IncomeUseCase } from './income.use_case';
import { IncomeRepositoryModule } from 'src/infrastructure/database/repositories/income-repository.module';
import { RoomieRepositoryModule } from 'src/infrastructure/database/repositories/roomie-repository.module';
import { RoomieHouseRepositoryModule } from 'src/infrastructure/database/repositories/roomie-house-repository.module';
import { ExpenseRepositoryModule } from 'src/infrastructure/database/repositories/expense-repository.module';

@Module({
    imports: [
        IncomeRepositoryModule,
        RoomieRepositoryModule,
        RoomieHouseRepositoryModule,
        ExpenseRepositoryModule
    ],
    providers: [IncomeUseCase],
    exports: [IncomeUseCase]
})
export class IncomeUseCaseModule { }
