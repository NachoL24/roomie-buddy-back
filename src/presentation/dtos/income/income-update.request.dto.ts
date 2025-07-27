export class IncomeUpdateRequestDto {
    description?: string;
    amount?: number;
    earnedAt?: Date;
    isRecurring?: boolean;
    recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}
