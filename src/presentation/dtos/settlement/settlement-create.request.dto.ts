export class SettlementCreateRequestDto {
    fromRoomieId: number;   // Quién paga
    toRoomieId: number;     // A quién le pago
    amount: number;         // Cuánto le pago
    date: Date;             // Fecha y hora del pago (ISO 8601)
    description?: string;   // "Pago por supermercado + luz"
    houseId: number;        // En qué casa
}
