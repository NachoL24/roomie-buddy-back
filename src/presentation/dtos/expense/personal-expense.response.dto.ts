export class PersonalExpenseResponseDto {
    id: number;
    description?: string;
    amount: number;
    date: Date;
    createdAt: Date;
    updatedAt?: Date;
    paidById: number;
}
