export class BalanceDto {
    roomieId: number;
    owesToMe: number;      // Cuánto me deben en total
    iOwe: number;          // Cuánto debo en total  
    netBalance: number;    // Balance neto (positivo = me deben, negativo = debo)
}

export class DetailedBalanceDto {
    withRoomieId: number;
    amount: number;        // Positivo = me debe, Negativo = le debo
    description: string;   // "Te debe por gastos compartidos"
}

export class HouseBalanceSummaryResponseDto {
    houseId: number;
    myBalance: BalanceDto;
    detailedBalances: DetailedBalanceDto[];
}
