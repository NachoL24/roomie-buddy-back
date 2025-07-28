import { Module } from '@nestjs/common';
import { HouseRepositoryModule } from './house-repository.module';
import { RoomieRepositoryModule } from './roomie-repository.module';
import { ExpenseRepositoryModule } from './expense-repository.module';
import { ExpenseShareRepositoryModule } from './expense-share-repository.module';
import { RoomieHouseRepositoryModule } from './roomie-house-repository.module';
import { InvitationRepositoryModule } from './invitation-repository.module';
import { SettlementRepositoryModule } from './settlement-repository.module';
import { IncomeRepositoryModule } from './income-repository.module';

@Module({
    imports: [
        HouseRepositoryModule,
        RoomieRepositoryModule,
        ExpenseRepositoryModule,
        ExpenseShareRepositoryModule,
        RoomieHouseRepositoryModule,
        InvitationRepositoryModule,
        SettlementRepositoryModule,
        IncomeRepositoryModule,
    ],
    exports: [
        HouseRepositoryModule,
        RoomieRepositoryModule,
        ExpenseRepositoryModule,
        ExpenseShareRepositoryModule,
        RoomieHouseRepositoryModule,
        InvitationRepositoryModule,
        SettlementRepositoryModule,
        IncomeRepositoryModule,
    ],
})
export class RepositoriesModule { }
