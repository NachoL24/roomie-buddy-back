import { ExpenseResponseDto } from './expense.response.dto';
import { ExpenseShareResponseDto } from './expense-share.response.dto';

export class ExpenseWithSharesResponseDto extends ExpenseResponseDto {
    expenseShares: ExpenseShareResponseDto[];
}
