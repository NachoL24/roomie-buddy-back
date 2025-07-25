export class ExpenseShare {
    public readonly id: number;
    public readonly expenseId: number;
    public readonly roomieId: number;
    public readonly shareAmount: number;

    constructor(
        id: number,
        expenseId: number,
        roomieId: number,
        shareAmount: number
    ) {
        this.id = id;
        this.expenseId = expenseId;
        this.roomieId = roomieId;
        this.shareAmount = shareAmount;
    }

    public static create(
        expenseId: number,
        roomieId: number,
        shareAmount: number,
        id?: number
    ): ExpenseShare {
        return new ExpenseShare(
            id || 0,
            expenseId,
            roomieId,
            shareAmount
        );
    }
}
