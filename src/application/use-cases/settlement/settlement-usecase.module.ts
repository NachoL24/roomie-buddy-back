import { Module } from '@nestjs/common';
import { SettlementUseCase } from './settlement.use_case';
import { SettlementRepositoryModule } from 'src/infrastructure/database/repositories/settlement-repository.module';
import { ExpenseRepositoryModule } from 'src/infrastructure/database/repositories/expense-repository.module';
import { ExpenseShareRepositoryModule } from 'src/infrastructure/database/repositories/expense-share-repository.module';
import { RoomieHouseRepositoryModule } from 'src/infrastructure/database/repositories/roomie-house-repository.module';
import { RoomieRepositoryModule } from 'src/infrastructure/database/repositories/roomie-repository.module';

@Module({
    imports: [
        SettlementRepositoryModule,
        ExpenseRepositoryModule,
        ExpenseShareRepositoryModule,
        RoomieHouseRepositoryModule,
        RoomieRepositoryModule
    ],
    providers: [SettlementUseCase],
    exports: [SettlementUseCase]
})
export class SettlementUseCaseModule { }
