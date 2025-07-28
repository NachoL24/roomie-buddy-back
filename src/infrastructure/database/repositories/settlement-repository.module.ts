import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settlement } from '../entities/settlement.db-entity';
import { SettlementTypeOrmRepository } from './settlement.repository.impl';

export const SETTLEMENT_REPOSITORY = 'SETTLEMENT_REPOSITORY';

@Module({
    imports: [TypeOrmModule.forFeature([Settlement])],
    providers: [
        {
            provide: SETTLEMENT_REPOSITORY,
            useClass: SettlementTypeOrmRepository,
        },
    ],
    exports: [SETTLEMENT_REPOSITORY],
})
export class SettlementRepositoryModule { }
