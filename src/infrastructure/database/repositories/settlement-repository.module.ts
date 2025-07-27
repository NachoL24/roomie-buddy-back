import { Module } from '@nestjs/common';
import { SettlementRepositoryImpl } from './settlement.repository.impl';

export const SETTLEMENT_REPOSITORY = 'SETTLEMENT_REPOSITORY';

@Module({
    providers: [
        {
            provide: SETTLEMENT_REPOSITORY,
            useClass: SettlementRepositoryImpl,
        },
    ],
    exports: [SETTLEMENT_REPOSITORY],
})
export class SettlementRepositoryModule { }
