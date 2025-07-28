export class Income {
    public readonly id: number;
    public readonly description: string;
    public readonly amount: number;
    public readonly earnedById: number; // Quien recibió el ingreso
    public readonly houseId?: number;
    public readonly isRecurring: boolean; // Para sueldos mensuales, etc.
    public readonly recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    public readonly nextRecurrenceDate?: Date;
    public readonly earnedAt: Date;
    public readonly createdAt: Date;

    constructor(
        id: number,
        description: string,
        amount: number,
        earnedById: number,
        houseId: number | undefined,
        earnedAt: Date,
        createdAt: Date,
        isRecurring: boolean = false,
        recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        nextRecurrenceDate?: Date
    ) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.earnedById = earnedById;
        this.houseId = houseId;
        this.earnedAt = earnedAt;
        this.createdAt = createdAt;
        this.isRecurring = isRecurring;
        this.recurrenceFrequency = recurrenceFrequency;
        this.nextRecurrenceDate = nextRecurrenceDate;
    }

    public static create(
        description: string,
        amount: number,
        earnedById: number,
        houseId?: number,
        earnedAt?: Date,
        id?: number,
        isRecurring: boolean = false,
        recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        nextRecurrenceDate?: Date,
        createdAt?: Date
    ): Income {
        return new Income(
            id || 0,
            description,
            amount,
            earnedById,
            houseId,
            earnedAt || new Date(),
            createdAt || new Date(),
            isRecurring,
            recurrenceFrequency,
            nextRecurrenceDate
        );
    }

    public updateAmount(newAmount: number): Income {
        return new Income(
            this.id,
            this.description,
            newAmount,
            this.earnedById,
            this.houseId,
            this.earnedAt,
            this.createdAt,
            this.isRecurring,
            this.recurrenceFrequency,
            this.nextRecurrenceDate
        );
    }

    public updateDescription(newDescription: string): Income {
        return new Income(
            this.id,
            newDescription,
            this.amount,
            this.earnedById,
            this.houseId,
            this.earnedAt,
            this.createdAt,
            this.isRecurring,
            this.recurrenceFrequency,
            this.nextRecurrenceDate
        );
    }

    public calculateNextRecurrence(): Income | null {
        if (!this.isRecurring || !this.recurrenceFrequency) {
            return null;
        }

        let nextDate = new Date(this.earnedAt);

        switch (this.recurrenceFrequency) {
            case 'WEEKLY':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'BIWEEKLY':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'MONTHLY':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'YEARLY':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }

        return new Income(
            0, // Nuevo ID se asigna al crear
            this.description,
            this.amount,
            this.earnedById,
            this.houseId,
            nextDate,
            new Date(),
            this.isRecurring,
            this.recurrenceFrequency,
            this.calculateNextRecurrenceDate(nextDate)
        );
    }

    private calculateNextRecurrenceDate(currentDate: Date): Date {
        const nextDate = new Date(currentDate);

        switch (this.recurrenceFrequency) {
            case 'WEEKLY':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'BIWEEKLY':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'MONTHLY':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'YEARLY':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }

        return nextDate;
    }
}
