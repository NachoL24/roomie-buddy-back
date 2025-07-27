import { Expense } from '../entities/expense.entity';

export interface ExpenseRepository {
    findById(id: number): Promise<Expense | null>;
    findAll(): Promise<Expense[]>;
    save(expense: Expense): Promise<Expense>;
    delete(id: number): Promise<void>;
    findByHouseId(houseId: number): Promise<Expense[]>;
    findByPaidById(paidById: number): Promise<Expense[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
    findByHouseIdAndDateRange(houseId: number, startDate: Date, endDate: Date): Promise<Expense[]>;
}
