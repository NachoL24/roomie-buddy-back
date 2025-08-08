import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income as DbIncome } from '../entities/income.db-entity';
import { TypeOrmIncomeRepository } from './income.repository.impl';

export const INCOME_REPOSITORY = 'INCOME_REPOSITORY';

@Module({
    imports: [TypeOrmModule.forFeature([DbIncome])],
    providers: [
        {
            provide: INCOME_REPOSITORY,
            useClass: TypeOrmIncomeRepository,
        },
    ],
    exports: [INCOME_REPOSITORY],
})
export class IncomeRepositoryModule { }
