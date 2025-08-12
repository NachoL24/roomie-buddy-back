export class SettlementResponseDto {
    id: number;
    fromRoomieId: number;
    toRoomieId: number;
    amount: number;
    date: Date;            // Fecha y hora del pago
    description?: string;
    houseId: number;
    createdAt: Date;
}
