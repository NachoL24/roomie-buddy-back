import { Income as DomainIncome } from '../../domain/entities/income.entity';
import { Income as DbIncome } from '../database/entities/income.db-entity';

export class IncomeMapper {
    public static toDomain(dbIncome: DbIncome): DomainIncome {
        return new DomainIncome(
            dbIncome.id,
            dbIncome.description,
            Number(dbIncome.amount),
            dbIncome.earnedBy?.id || 0,
            dbIncome.house?.id,
            dbIncome.earnedAt,
            dbIncome.createdAt,
            dbIncome.isRecurring,
            dbIncome.recurrenceFrequency,
            dbIncome.nextRecurrenceDate
        );
    }

    public static toDatabase(domainIncome: DomainIncome): DbIncome {
        const dbIncome = new DbIncome();
        if (domainIncome.id !== 0) {
            dbIncome.id = domainIncome.id;
        }
        dbIncome.description = domainIncome.description;
        dbIncome.amount = domainIncome.amount;
        dbIncome.earnedAt = domainIncome.earnedAt;
        dbIncome.createdAt = domainIncome.createdAt;
        dbIncome.isRecurring = domainIncome.isRecurring;
        dbIncome.recurrenceFrequency = domainIncome.recurrenceFrequency;
        dbIncome.nextRecurrenceDate = domainIncome.nextRecurrenceDate;
        // Note: earnedBy and house relationships need to be set separately
        return dbIncome;
    }

    public static toDomainArray(dbIncomes: DbIncome[]): DomainIncome[] {
        return dbIncomes.map(dbIncome => this.toDomain(dbIncome));
    }
}
