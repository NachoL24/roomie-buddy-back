import { ExpenseShare } from '../entities/expense-share.entity';

export interface ExpenseShareRepository {
    findById(id: number): Promise<ExpenseShare | null>;
    findAll(): Promise<ExpenseShare[]>;
    save(expenseShare: ExpenseShare): Promise<ExpenseShare>;
    delete(id: number): Promise<void>;
    findByExpenseId(expenseId: number): Promise<ExpenseShare[]>;
    findByRoomieId(roomieId: number): Promise<ExpenseShare[]>;
    findByExpenseAndRoomie(expenseId: number, roomieId: number): Promise<ExpenseShare | null>;
}
