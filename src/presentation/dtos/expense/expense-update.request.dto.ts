import { ExpenseShareDto } from './expense-share.dto';

export class ExpenseUpdateRequestDto {
    description?: string;
    amount?: number;
    date?: Date;
    paidById?: number;
    expenseShares?: ExpenseShareDto[];
}
