import { Income } from "src/domain/entities/income.entity";

export class IncomeResponseDto {
    public readonly id: number;
    public readonly description: string;
    public readonly amount: number;
    public readonly earnedById: number;
    public readonly houseId: number;
    public readonly isRecurring: boolean;
    public readonly recurrenceFrequency?: string;
    public readonly nextRecurrenceDate?: Date;
    public readonly earnedAt: Date;
    public readonly createdAt: Date;

    constructor(
        id: number,
        description: string,
        amount: number,
        earnedById: number,
        houseId: number,
        isRecurring: boolean,
        earnedAt: Date,
        createdAt: Date,
        recurrenceFrequency?: string,
        nextRecurrenceDate?: Date
    ) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.earnedById = earnedById;
        this.houseId = houseId;
        this.isRecurring = isRecurring;
        this.earnedAt = earnedAt;
        this.createdAt = createdAt;
        this.recurrenceFrequency = recurrenceFrequency;
        this.nextRecurrenceDate = nextRecurrenceDate;
    }

    static create(income: Income): IncomeResponseDto {
        return new IncomeResponseDto(
            income.id,
            income.description,
            income.amount,
            income.earnedById,
            income.houseId,
            income.isRecurring,
            income.earnedAt,
            income.createdAt,
            income.recurrenceFrequency,
            income.nextRecurrenceDate
        );
    }

    toJSON() {
        return {
            id: this.id,
            description: this.description,
            amount: this.amount,
            earnedById: this.earnedById,
            houseId: this.houseId,
            isRecurring: this.isRecurring,
            recurrenceFrequency: this.recurrenceFrequency,
            nextRecurrenceDate: this.nextRecurrenceDate,
            earnedAt: this.earnedAt,
            createdAt: this.createdAt
        };
    }
}
