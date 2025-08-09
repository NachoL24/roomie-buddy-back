import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense as DomainExpense } from '../../../domain/entities/expense.entity';
import { ExpenseRepository } from '../../../domain/repositories/expense.repository';
import { Expense as DbExpense } from '../entities/expense.db-entity';
import { ExpenseMapper } from '../../mappers/expense.mapper';

@Injectable()
export class TypeOrmExpenseRepository implements ExpenseRepository {
    constructor(
        @InjectRepository(DbExpense)
        private readonly expenseRepository: Repository<DbExpense>
    ) { }

    async findById(id: number): Promise<DomainExpense | null> {
        const dbExpense = await this.expenseRepository.findOne({
            where: { id },
            relations: ['paidBy', 'house']
        });
        return dbExpense ? ExpenseMapper.toDomain(dbExpense) : null;
    }

    async findAll(): Promise<DomainExpense[]> {
        const dbExpenses = await this.expenseRepository.find({
            relations: ['paidBy', 'house']
        });
        return ExpenseMapper.toDomainArray(dbExpenses);
    }

    async save(expense: DomainExpense): Promise<DomainExpense> {
        const dbExpense = ExpenseMapper.toDatabase(expense);

        // Set relations manually
        if (expense.paidById) {
            dbExpense.paidBy = { id: expense.paidById } as any;
        }
        if (expense.houseId) {
            dbExpense.house = { id: expense.houseId } as any;
        }

        const savedDbExpense = await this.expenseRepository.save(dbExpense);

        // Fetch the complete entity with relations
        const completeExpense = await this.expenseRepository.findOne({
            where: { id: savedDbExpense.id },
            relations: ['paidBy', 'house']
        });

        return ExpenseMapper.toDomain(completeExpense!);
    }

    async delete(id: number): Promise<void> {
        await this.expenseRepository.softDelete(id);
    }

    async findByHouseId(houseId: number): Promise<DomainExpense[]> {
        const dbExpenses = await this.expenseRepository.find({
            where: { house: { id: houseId } },
            relations: ['paidBy', 'house']
        });
        return ExpenseMapper.toDomainArray(dbExpenses);
    }

    async findByPaidById(paidById: number): Promise<DomainExpense[]> {
        const dbExpenses = await this.expenseRepository.find({
            where: { paidBy: { id: paidById } },
            relations: ['paidBy', 'house']
        });
        return ExpenseMapper.toDomainArray(dbExpenses);
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<DomainExpense[]> {
        const dbExpenses = await this.expenseRepository.find({
            where: { date: Between(startDate, endDate) },
            relations: ['paidBy', 'house']
        });
        return ExpenseMapper.toDomainArray(dbExpenses);
    }

    async findByHouseIdAndDateRange(houseId: number, startDate: Date, endDate: Date): Promise<DomainExpense[]> {
        const dbExpenses = await this.expenseRepository.find({
            where: {
                house: { id: houseId },
                date: Between(startDate, endDate)
            },
            relations: ['paidBy', 'house']
        });
        return ExpenseMapper.toDomainArray(dbExpenses);
    }

    async findByPaidByIdPaginated(paidById: number, page: number, pageSize: number): Promise<{ expenses: DomainExpense[], totalCount: number }> {
        const [dbExpenses, totalCount] = await this.expenseRepository.findAndCount({
            where: { paidBy: { id: paidById } },
            relations: ['paidBy', 'house'],
            order: { date: 'DESC' }, // Order by date descending (most recent first)
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        return {
            expenses: ExpenseMapper.toDomainArray(dbExpenses),
            totalCount
        };
    }
}
