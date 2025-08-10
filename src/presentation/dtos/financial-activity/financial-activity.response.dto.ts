import { Expense } from "src/domain/entities/expense.entity";
import { Income } from "src/domain/entities/income.entity";
import { Settlement } from "src/domain/entities/settlement.entity";

export class FinancialActivityResponseDto {
    id: number;
    type: 'expense' | 'income' | 'settlement';
    personal: boolean;
    houseName: string | null;
    description?: string;
    amount: number;
    date: Date; // Date when expense was made or income was earned

    constructor(
        id: number,
        type: 'expense' | 'income' | 'settlement',
        personal: boolean,
        houseName: string | null,
        amount: number,
        date: Date,
        description?: string
    ) {
        this.id = id;
        this.type = type;
        this.personal = personal;
        this.houseName = houseName;
        this.amount = amount;
        this.date = date;
        this.description = description;
    }

    public static fromExpense(expense: Expense, houseName: string | null): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            expense.id,
            'expense',
            expense.houseId === null || expense.houseId === undefined,
            houseName,
            expense.amount,
            expense.date,
            expense.description
        );
    }

    public static fromIncome(income: Income, houseName: string | null): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            income.id,
            'income',
            income.houseId === null || income.houseId === undefined,
            houseName,
            income.amount,
            income.earnedAt,
            income.description
        );
    }

    public static fromSettlement(settlement: Settlement, houseName: string | null): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            settlement.id,
            'settlement',
            false, // settlements siempre pertenecen a una casa
            houseName,
            settlement.amount,
            settlement.createdAt,
            settlement.description
        );
    }
}
