import { Injectable } from '@nestjs/common';
import { Income } from 'src/domain/entities/income.entity';
import { IncomeRepository } from 'src/domain/repositories/income.repository';

@Injectable()
export class IncomeRepositoryImpl implements IncomeRepository {
    private incomes: Income[] = [];
    private currentId = 1;

    async findById(id: number): Promise<Income | null> {
        return this.incomes.find(income => income.id === id) || null;
    }

    async findAll(): Promise<Income[]> {
        return [...this.incomes];
    }

    async findByHouseId(houseId: number): Promise<Income[]> {
        return this.incomes.filter(income => income.houseId === houseId);
    }

    async findByEarnedById(earnedById: number): Promise<Income[]> {
        return this.incomes.filter(income => income.earnedById === earnedById);
    }

    async findByHouseIdAndDateRange(houseId: number, startDate: Date, endDate: Date): Promise<Income[]> {
        return this.incomes.filter(income =>
            income.houseId === houseId &&
            income.earnedAt >= startDate &&
            income.earnedAt <= endDate
        );
    }

    async findRecurringIncomes(): Promise<Income[]> {
        return this.incomes.filter(income => income.isRecurring);
    }

    async save(income: Income): Promise<Income> {
        const incomeWithId = Income.create(
            income.description,
            income.amount,
            income.earnedById,
            income.houseId,
            income.earnedAt,
            this.currentId++,
            income.isRecurring,
            income.recurrenceFrequency,
            income.nextRecurrenceDate,
            income.createdAt
        );

        this.incomes.push(incomeWithId);
        return incomeWithId;
    }

    async update(income: Income): Promise<Income> {
        const index = this.incomes.findIndex(existing => existing.id === income.id);
        if (index === -1) {
            throw new Error(`Income with ID ${income.id} not found`);
        }

        this.incomes[index] = income;
        return income;
    }

    async delete(id: number): Promise<void> {
        const index = this.incomes.findIndex(income => income.id === id);
        if (index !== -1) {
            this.incomes.splice(index, 1);
        }
    }
}
