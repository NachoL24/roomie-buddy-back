export class ExpenseShareResponseDto {
    id: number;
    expenseId: number;
    roomieId: number;
    roomieName: string;
    roomiePicture?: string;
    shareAmount: number;
}
