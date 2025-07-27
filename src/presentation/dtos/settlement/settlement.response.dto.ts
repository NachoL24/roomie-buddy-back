export class SettlementResponseDto {
    id: number;
    fromRoomieId: number;
    toRoomieId: number;
    amount: number;
    description?: string;
    houseId: number;
    createdAt: Date;
}
