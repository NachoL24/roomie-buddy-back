export class SettlementUpdateRequestDto {
    amount?: number;
    date?: Date; // ISO 8601
    description?: string;
    toRoomieId?: number;
    fromRoomieId?: number;
}
