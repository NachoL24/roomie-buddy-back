export class IncomeCreateRequestDto {
    description: string;
    amount: number;
    earnedAt?: Date;
    isRecurring?: boolean;
    recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    // houseId se asigna automáticamente como null para ingresos personales
}
