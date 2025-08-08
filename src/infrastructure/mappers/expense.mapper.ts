import { Expense as DomainExpense } from '../../domain/entities/expense.entity';
import { Expense as DbExpense } from '../database/entities/expense.db-entity';

export class ExpenseMapper {
    public static toDomain(dbExpense: DbExpense): DomainExpense {
        return new DomainExpense(
            dbExpense.id,
            Number(dbExpense.amount),
            dbExpense.date,
            dbExpense.paidBy?.id || 0,
            dbExpense.createdAt,
            dbExpense.house?.id,
            dbExpense.description,
            dbExpense.updatedAt,
            dbExpense.deletedAt
        );
    }

    public static toDatabase(domainExpense: DomainExpense): DbExpense {
        const dbExpense = new DbExpense();
        if (domainExpense.id !== 0) {
            dbExpense.id = domainExpense.id;
        }
        dbExpense.description = domainExpense.description;
        dbExpense.amount = domainExpense.amount;
        dbExpense.date = domainExpense.date;
        dbExpense.createdAt = domainExpense.createdAt;
        dbExpense.updatedAt = domainExpense.updatedAt;
        dbExpense.deletedAt = domainExpense.deletedAt;
        // Note: paidBy and house relationships need to be set separately
        return dbExpense;
    }

    public static toDomainArray(dbExpenses: DbExpense[]): DomainExpense[] {
        return dbExpenses.map(dbExpense => this.toDomain(dbExpense));
    }
}
