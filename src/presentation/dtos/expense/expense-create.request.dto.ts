import { ExpenseShareDto } from './expense-share.dto';

export class ExpenseCreateRequestDto {
    description?: string;
    amount: number;
    date: Date;
    paidById: number;
    houseId: number;
    expenseShares?: ExpenseShareDto[];
}
