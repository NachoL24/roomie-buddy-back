export class RemoveMemberResponseDto {
    public readonly message: string;
    public readonly removedRoomieId: number;
    public readonly houseId: number;
    public readonly removedBy: number;
    public readonly removedAt: Date;

    constructor(
        message: string,
        removedRoomieId: number,
        houseId: number,
        removedBy: number,
        removedAt: Date
    ) {
        this.message = message;
        this.removedRoomieId = removedRoomieId;
        this.houseId = houseId;
        this.removedBy = removedBy;
        this.removedAt = removedAt;
    }

    static create(
        removedRoomieId: number,
        houseId: number,
        removedBy: number
    ): RemoveMemberResponseDto {
        return new RemoveMemberResponseDto(
            `Roomie ${removedRoomieId} has been removed from house ${houseId}`,
            removedRoomieId,
            houseId,
            removedBy,
            new Date()
        );
    }

    toJSON() {
        return {
            message: this.message,
            removedRoomieId: this.removedRoomieId,
            houseId: this.houseId,
            removedBy: this.removedBy,
            removedAt: this.removedAt
        };
    }
}
