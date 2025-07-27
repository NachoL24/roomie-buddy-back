import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { EXPENSE_REPOSITORY, EXPENSE_SHARE_REPOSITORY, ROOMIE_HOUSE_REPOSITORY, ROOMIE_REPOSITORY, SETTLEMENT_REPOSITORY } from "src/infrastructure/database/repositories";
import { Settlement } from "src/domain/entities/settlement.entity";
import { ExpenseRepository, ExpenseShareRepository, RoomieHouseRepository, RoomieRepository, SettlementRepository } from "src/domain/repositories";
import { SettlementCreateRequestDto } from "src/presentation/dtos/settlement/settlement-create.request.dto";
import { SettlementResponseDto } from "src/presentation/dtos/settlement/settlement.response.dto";
import { HouseBalanceSummaryResponseDto, BalanceDto, DetailedBalanceDto } from "src/presentation/dtos/settlement/balance-summary.response.dto";

@Injectable()
export class SettlementUseCase {

    constructor(
        @Inject(SETTLEMENT_REPOSITORY) private readonly settlementRepository: SettlementRepository,
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
        @Inject(EXPENSE_SHARE_REPOSITORY) private readonly expenseShareRepository: ExpenseShareRepository,
        @Inject(ROOMIE_HOUSE_REPOSITORY) private readonly roomieHouseRepository: RoomieHouseRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
    ) { }

    async createSettlement(createSettlementDto: SettlementCreateRequestDto, auth0Sub: string): Promise<SettlementResponseDto> {
        // Obtener el roomie por auth0Sub
        const fromRoomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!fromRoomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Validar que ambos roomies sean miembros activos de la casa
        const fromMembership = await this.roomieHouseRepository.findByRoomieAndHouse(fromRoomie.id, createSettlementDto.houseId);
        if (!fromMembership) {
            throw new BadRequestException(`Roomie ${fromRoomie.id} is not an active member of house ${createSettlementDto.houseId}`);
        }

        const toMembership = await this.roomieHouseRepository.findByRoomieAndHouse(createSettlementDto.toRoomieId, createSettlementDto.houseId);
        if (!toMembership) {
            throw new BadRequestException(`Roomie ${createSettlementDto.toRoomieId} is not an active member of house ${createSettlementDto.houseId}`);
        }

        // Validar que no se pague a sí mismo
        if (fromRoomie.id === createSettlementDto.toRoomieId) {
            throw new BadRequestException("Cannot create settlement to yourself");
        }

        // Validar que el monto sea positivo
        if (createSettlementDto.amount <= 0) {
            throw new BadRequestException("Settlement amount must be positive");
        }

        // Crear el settlement
        const settlement = Settlement.create(
            fromRoomie.id,
            createSettlementDto.toRoomieId,
            createSettlementDto.amount,
            createSettlementDto.houseId,
            undefined,
            createSettlementDto.description
        );

        const savedSettlement = await this.settlementRepository.save(settlement);

        return this.mapToSettlementResponse(savedSettlement);
    }

    async getSettlementsByHouseId(houseId: number): Promise<SettlementResponseDto[]> {
        const settlements = await this.settlementRepository.findByHouseId(houseId);
        return settlements.map(settlement => this.mapToSettlementResponse(settlement));
    }

    async getBalanceSummary(auth0Sub: string, houseId: number): Promise<HouseBalanceSummaryResponseDto> {
        // Obtener el roomie por auth0Sub
        const roomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!roomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Verificar que el roomie es miembro de la casa
        const membership = await this.roomieHouseRepository.findByRoomieAndHouse(roomie.id, houseId);
        if (!membership) {
            throw new BadRequestException(`Roomie ${roomie.id} is not an active member of house ${houseId}`);
        }

        // Obtener todos los miembros de la casa
        const houseMembers = await this.roomieHouseRepository.findByHouseId(houseId);
        const memberIds = houseMembers.map(member => member.roomieId);

        // Calcular balances desde expenses
        const expenseBalances = await this.calculateExpenseBalances(roomie.id, houseId, memberIds);

        // Calcular settlements (pagos realizados)
        const settlementBalances = await this.calculateSettlementBalances(roomie.id, houseId);

        // Combinar balances
        const combinedBalances = this.combineBalances(expenseBalances, settlementBalances, memberIds, roomie.id);

        // Calcular balance total
        const totalOwesToMe = Object.values(combinedBalances).filter(balance => balance > 0).reduce((sum, balance) => sum + balance, 0);
        const totalIOwe = Math.abs(Object.values(combinedBalances).filter(balance => balance < 0).reduce((sum, balance) => sum + balance, 0));
        const netBalance = totalOwesToMe - totalIOwe;

        const myBalance = new BalanceDto();
        myBalance.roomieId = roomie.id;
        myBalance.owesToMe = Math.round(totalOwesToMe * 100) / 100;
        myBalance.iOwe = Math.round(totalIOwe * 100) / 100;
        myBalance.netBalance = Math.round(netBalance * 100) / 100;

        // Crear balances detallados
        const detailedBalances: DetailedBalanceDto[] = [];
        for (const [otherRoomieId, balance] of Object.entries(combinedBalances)) {
            const roomieIdNum = parseInt(otherRoomieId);
            if (roomieIdNum !== roomie.id && Math.abs(balance) > 0.01) { // Solo mostrar si hay balance significativo
                const detailedBalance = new DetailedBalanceDto();
                detailedBalance.withRoomieId = roomieIdNum;
                detailedBalance.amount = Math.round(balance * 100) / 100;
                detailedBalance.description = balance > 0
                    ? `Te debe $${Math.abs(detailedBalance.amount)} por gastos compartidos`
                    : `Le debes $${Math.abs(detailedBalance.amount)} por gastos compartidos`;
                detailedBalances.push(detailedBalance);
            }
        }

        const response = new HouseBalanceSummaryResponseDto();
        response.houseId = houseId;
        response.myBalance = myBalance;
        response.detailedBalances = detailedBalances.sort((a, b) => b.amount - a.amount); // Ordenar por monto descendente

        return response;
    }

    private async calculateExpenseBalances(roomieId: number, houseId: number, memberIds: number[]): Promise<Record<number, number>> {
        const balances: Record<number, number> = {};

        // Inicializar balances
        memberIds.forEach(id => balances[id] = 0);

        // Obtener todos los expenses de la casa
        const houseExpenses = await this.expenseRepository.findByHouseId(houseId);

        for (const expense of houseExpenses) {
            // Obtener shares del expense
            const expenseShares = await this.expenseShareRepository.findByExpenseId(expense.id);

            // Para cada share, calcular cuánto debe cada roomie al pagador
            for (const share of expenseShares) {
                if (share.roomieId !== expense.paidById) {
                    // Este roomie le debe al pagador
                    if (share.roomieId === roomieId) {
                        // Yo le debo al pagador
                        balances[expense.paidById] = (balances[expense.paidById] || 0) - share.shareAmount;
                    } else if (expense.paidById === roomieId) {
                        // El otro roomie me debe a mí
                        balances[share.roomieId] = (balances[share.roomieId] || 0) + share.shareAmount;
                    }
                }
            }
        }

        return balances;
    }

    private async calculateSettlementBalances(roomieId: number, houseId: number): Promise<Record<number, number>> {
        const balances: Record<number, number> = {};

        // Obtener settlements donde este roomie participó
        const settlements = await this.settlementRepository.findByHouseId(houseId);
        const roomieSettlements = settlements.filter(s => s.fromRoomieId === roomieId || s.toRoomieId === roomieId);

        for (const settlement of roomieSettlements) {
            if (settlement.fromRoomieId === roomieId) {
                // Este roomie pagó - restar del balance con el receptor
                balances[settlement.toRoomieId] = (balances[settlement.toRoomieId] || 0) - settlement.amount;
            } else if (settlement.toRoomieId === roomieId) {
                // Este roomie recibió - sumar al balance con el pagador
                balances[settlement.fromRoomieId] = (balances[settlement.fromRoomieId] || 0) + settlement.amount;
            }
        }

        return balances;
    }

    private combineBalances(
        expenseBalances: Record<number, number>,
        settlementBalances: Record<number, number>,
        memberIds: number[],
        roomieId: number
    ): Record<number, number> {
        const combined: Record<number, number> = {};

        // Combinar balances de expenses y settlements para cada miembro
        memberIds.forEach(memberId => {
            if (memberId !== roomieId) {
                const expenseBalance = expenseBalances[memberId] || 0;
                const settlementBalance = settlementBalances[memberId] || 0;

                // Balance final = balance de expenses + ajustes por settlements
                combined[memberId] = expenseBalance + settlementBalance;
            }
        });

        return combined;
    }

    private mapToSettlementResponse(settlement: Settlement): SettlementResponseDto {
        const response = new SettlementResponseDto();
        response.id = settlement.id;
        response.fromRoomieId = settlement.fromRoomieId;
        response.toRoomieId = settlement.toRoomieId;
        response.amount = settlement.amount;
        response.description = settlement.description;
        response.houseId = settlement.houseId;
        response.createdAt = settlement.createdAt;
        return response;
    }
}
