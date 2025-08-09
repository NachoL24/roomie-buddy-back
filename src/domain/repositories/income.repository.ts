import { Income } from '../entities/income.entity';

export interface IncomeRepository {
    findById(id: number): Promise<Income | null>;
    findAll(): Promise<Income[]>;
    findByHouseId(houseId: number): Promise<Income[]>;
    findByEarnedById(earnedById: number): Promise<Income[]>;
    findByHouseIdAndDateRange(houseId: number, startDate: Date, endDate: Date): Promise<Income[]>;
    findRecurringIncomes(): Promise<Income[]>;
    save(income: Income): Promise<Income>;
    update(income: Income): Promise<Income>;
    delete(id: number): Promise<void>;
    findByEarnedByIdPaginated(earnedById: number, page: number, pageSize: number): Promise<{ incomes: Income[], totalCount: number }>;
}
