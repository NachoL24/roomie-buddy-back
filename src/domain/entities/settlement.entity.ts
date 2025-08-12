export class Settlement {
    public readonly id: number;
    public readonly fromRoomieId: number; // Quien paga
    public readonly toRoomieId: number;   // Quien recibe
    public readonly amount: number;
    public readonly date: Date;           // Fecha del pago
    public readonly description?: string;
    public readonly houseId: number;
    public readonly createdAt: Date;

    constructor(
        id: number,
        fromRoomieId: number,
        toRoomieId: number,
        amount: number,
        date: Date,
        houseId: number,
        createdAt: Date,
        description?: string
    ) {
        this.id = id;
        this.fromRoomieId = fromRoomieId;
        this.toRoomieId = toRoomieId;
        this.amount = amount;
        this.date = date;
        this.houseId = houseId;
        this.createdAt = createdAt;
        this.description = description;
    }

    public static create(
        fromRoomieId: number,
        toRoomieId: number,
        amount: number,
        date: Date,
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
            date,
            houseId,
            createdAt || new Date(),
            description
        );
    }
}
