export class PersonalExpenseCreateRequestDto {
    description?: string;
    amount: number;
    date: Date;
    paidById: number;
}
