import { Module } from '@nestjs/common';
import { IncomeRepositoryImpl } from './income.repository.impl';

export const INCOME_REPOSITORY = 'INCOME_REPOSITORY';

@Module({
    providers: [
        {
            provide: INCOME_REPOSITORY,
            useClass: IncomeRepositoryImpl,
        },
    ],
    exports: [INCOME_REPOSITORY],
})
export class IncomeRepositoryModule { }
