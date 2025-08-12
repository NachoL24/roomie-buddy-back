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
    // Enrichment: payer details for UI
    paidByName?: string;
    paidByPicture?: string;
    // Enrichment: settlement recipient details for UI
    paidToName?: string;
    paidToPicture?: string;
    // IDs to enable direction logic on the client
    paidById?: number;
    paidToId?: number;

    constructor(
        id: number,
        type: 'expense' | 'income' | 'settlement',
        personal: boolean,
        houseName: string | null,
        amount: number,
        date: Date,
        description?: string,
        paidByName?: string,
        paidByPicture?: string,
        paidToName?: string,
        paidToPicture?: string,
        paidById?: number,
        paidToId?: number
    ) {
        this.id = id;
        this.type = type;
        this.personal = personal;
        this.houseName = houseName;
        this.amount = amount;
        this.date = date;
        this.description = description;
        this.paidByName = paidByName;
        this.paidByPicture = paidByPicture;
        this.paidToName = paidToName;
        this.paidToPicture = paidToPicture;
        this.paidById = paidById;
        this.paidToId = paidToId;
    }

    public static fromExpense(
        expense: Expense,
        houseName: string | null,
        paidByName?: string,
        paidByPicture?: string,
        paidById?: number
    ): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            expense.id,
            'expense',
            expense.houseId === null || expense.houseId === undefined,
            houseName,
            expense.amount,
            expense.date,
            expense.description,
            paidByName,
            paidByPicture,
            undefined,
            undefined,
            paidById
        );
    }

    public static fromIncome(
        income: Income,
        houseName: string | null,
        paidByName?: string,
        paidByPicture?: string,
        paidById?: number
    ): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            income.id,
            'income',
            income.houseId === null || income.houseId === undefined,
            houseName,
            income.amount,
            income.earnedAt,
            income.description,
            paidByName,
            paidByPicture,
            undefined,
            undefined,
            paidById
        );
    }

    public static fromSettlement(
        settlement: Settlement,
        houseName: string | null,
        toRoomieName?: string,
        paidByName?: string,
        paidByPicture?: string,
        paidToName?: string,
        paidToPicture?: string,
        paidById?: number,
        paidToId?: number
    ): FinancialActivityResponseDto {
        const base = `Transferencia a ${toRoomieName ?? 'miembro'}`;
        const description = settlement.description && settlement.description.trim().length > 0
            ? `${base}: ${settlement.description}`
            : base;
        return new FinancialActivityResponseDto(
            settlement.id,
            'settlement',
            false,
            houseName,
            settlement.amount,
            settlement.createdAt,
            settlement.description,
            paidByName,
            paidByPicture,
            paidToName,
            paidToPicture,
            paidById,
            paidToId
        );
    }
}
