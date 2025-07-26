import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseShare as DbExpenseShare } from '../entities/expense-share.db-entity';
import { TypeOrmExpenseShareRepository } from './expense-share.repository.impl';

export const EXPENSE_SHARE_REPOSITORY = Symbol('ExpenseShareRepository');

@Module({
    imports: [TypeOrmModule.forFeature([DbExpenseShare])],
    providers: [
        TypeOrmExpenseShareRepository,
        {
            provide: EXPENSE_SHARE_REPOSITORY,
            useExisting: TypeOrmExpenseShareRepository,
        },
    ],
    exports: [EXPENSE_SHARE_REPOSITORY],
})
export class ExpenseShareRepositoryModule { }
