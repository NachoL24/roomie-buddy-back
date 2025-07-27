export class SettlementCreateRequestDto {
    toRoomieId: number;     // A quién le pago
    amount: number;         // Cuánto le pago
    description?: string;   // "Pago por supermercado + luz"
    houseId: number;        // En qué casa
}
