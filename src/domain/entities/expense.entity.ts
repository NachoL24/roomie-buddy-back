export class Expense {
    public readonly id: number;
    public readonly description?: string;
    public readonly amount: number;
    public readonly date: Date;
    public readonly createdAt: Date;
    public readonly updatedAt?: Date;
    public readonly deletedAt?: Date;
    public readonly paidById: number;
    public readonly houseId: number;

    constructor(
        id: number,
        amount: number,
        date: Date,
        paidById: number,
        houseId: number,
        createdAt: Date,
        description?: string,
        updatedAt?: Date,
        deletedAt?: Date
    ) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.paidById = paidById;
        this.houseId = houseId;
        this.createdAt = createdAt;
        this.description = description;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public static create(
        amount: number,
        date: Date,
        paidById: number,
        houseId: number,
        id?: number,
        description?: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date
    ): Expense {
        return new Expense(
            id || 0,
            amount,
            date,
            paidById,
            houseId,
            createdAt || new Date(),
            description,
            updatedAt,
            deletedAt
        );
    }
}
