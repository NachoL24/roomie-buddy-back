import { Expense } from "src/domain/entities/expense.entity";
import { Income } from "src/domain/entities/income.entity";

export class FinancialActivityResponseDto {
    id: number;
    type: 'expense' | 'income';
    description?: string;
    amount: number;
    date: Date; // Date when expense was made or income was earned

    constructor(
        id: number,
        type: 'expense' | 'income',
        amount: number,
        date: Date,
        description?: string
    ) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.date = date;
        this.description = description;
    }

    public static fromExpense(expense: Expense): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            expense.id,
            'expense',
            expense.amount,
            expense.date,
            expense.description
        );
    }

    public static fromIncome(income: Income): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            income.id,
            'income',
            income.amount,
            income.earnedAt,
            income.description
        );
    }
}
