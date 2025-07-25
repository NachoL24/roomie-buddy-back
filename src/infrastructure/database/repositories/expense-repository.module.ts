import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense as DbExpense } from '../entities/expense.db-entity';
import { TypeOrmExpenseRepository } from './expense.repository.impl';

export const EXPENSE_REPOSITORY = 'ExpenseRepository';

@Module({
    imports: [TypeOrmModule.forFeature([DbExpense])],
    providers: [
        {
            provide: EXPENSE_REPOSITORY,
            useClass: TypeOrmExpenseRepository,
        },
    ],
    exports: [EXPENSE_REPOSITORY],
})
export class ExpenseRepositoryModule { }
