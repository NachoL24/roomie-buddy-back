export class ExpenseSummaryResponseDto {
    roomieId: number;
    totalPaid: number;
    totalOwed: number;
    balance: number; // totalPaid - totalOwed
    expenseCount: number;
}
