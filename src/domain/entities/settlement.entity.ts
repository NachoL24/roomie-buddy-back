export class Settlement {
    public readonly id: number;
    public readonly fromRoomieId: number; // Quien paga
    public readonly toRoomieId: number;   // Quien recibe
    public readonly amount: number;
    public readonly description?: string;
    public readonly houseId: number;
    public readonly createdAt: Date;

    constructor(
        id: number,
        fromRoomieId: number,
        toRoomieId: number,
        amount: number,
        houseId: number,
        createdAt: Date,
        description?: string
    ) {
        this.id = id;
        this.fromRoomieId = fromRoomieId;
        this.toRoomieId = toRoomieId;
        this.amount = amount;
        this.houseId = houseId;
        this.createdAt = createdAt;
        this.description = description;
    }

    public static create(
        fromRoomieId: number,
        toRoomieId: number,
        amount: number,
        houseId: number,
        id?: number,
        description?: string,
        createdAt?: Date
    ): Settlement {
        return new Settlement(
            id || 0,
            fromRoomieId,
            toRoomieId,
            amount,
            houseId,
            createdAt || new Date(),
            description
        );
    }
}
