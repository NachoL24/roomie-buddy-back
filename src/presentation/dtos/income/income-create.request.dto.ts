export class IncomeCreateRequestDto {
    description: string;
    amount: number;
    houseId: number;
    earnedAt?: Date;
    isRecurring?: boolean;
    recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}
