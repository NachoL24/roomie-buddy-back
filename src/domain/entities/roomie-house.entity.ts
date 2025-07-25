export class RoomieHouse {
    public readonly roomieId: number;
    public readonly houseId: number;
    public readonly payRatio?: number;

    constructor(
        roomieId: number,
        houseId: number,
        payRatio?: number
    ) {
        this.roomieId = roomieId;
        this.houseId = houseId;
        this.payRatio = payRatio;
    }

    public static create(
        roomieId: number,
        houseId: number,
        payRatio?: number
    ): RoomieHouse {
        return new RoomieHouse(
            roomieId,
            houseId,
            payRatio
        );
    }
}
