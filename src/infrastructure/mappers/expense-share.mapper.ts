import { ExpenseShare as DomainExpenseShare } from '../../domain/entities/expense-share.entity';
import { ExpenseShare as DbExpenseShare } from '../database/entities/expense-share.db-entity';

export class ExpenseShareMapper {
    public static toDomain(dbExpenseShare: DbExpenseShare): DomainExpenseShare {
        return new DomainExpenseShare(
            dbExpenseShare.id,
            dbExpenseShare.expenseId,
            dbExpenseShare.roomieId,
            Number(dbExpenseShare.shareAmount)
        );
    }

    public static toDatabase(domainExpenseShare: DomainExpenseShare): DbExpenseShare {
        const dbExpenseShare = new DbExpenseShare();
        if (domainExpenseShare.id !== 0) {
            dbExpenseShare.id = domainExpenseShare.id;
        }
        dbExpenseShare.expenseId = domainExpenseShare.expenseId;
        dbExpenseShare.roomieId = domainExpenseShare.roomieId;
        dbExpenseShare.shareAmount = domainExpenseShare.shareAmount;
        return dbExpenseShare;
    }

    public static toDomainArray(dbExpenseShares: DbExpenseShare[]): DomainExpenseShare[] {
        return dbExpenseShares.map(dbExpenseShare => this.toDomain(dbExpenseShare));
    }
}
