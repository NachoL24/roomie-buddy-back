import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { EXPENSE_REPOSITORY, EXPENSE_SHARE_REPOSITORY, ROOMIE_HOUSE_REPOSITORY, ROOMIE_REPOSITORY, SETTLEMENT_REPOSITORY } from "src/infrastructure/database/repositories";
import { Settlement } from "src/domain/entities/settlement.entity";
import { ExpenseRepository, ExpenseShareRepository, RoomieHouseRepository, RoomieRepository, SettlementRepository } from "src/domain/repositories";
import { SettlementCreateRequestDto } from "src/presentation/dtos/settlement/settlement-create.request.dto";
import { SettlementUpdateRequestDto } from "src/presentation/dtos/settlement/settlement-update.request.dto";
import { SettlementResponseDto } from "src/presentation/dtos/settlement/settlement.response.dto";
import { HouseBalanceSummaryResponseDto, BalanceDto, DetailedBalanceDto } from "src/presentation/dtos/settlement/balance-summary.response.dto";
import { PersonalFinanceSyncService } from "src/application/services/personal-finance-sync.service";
import { FinancialActivityResponseDto } from "src/presentation/dtos/financial-activity/financial-activity.response.dto";
import { Roomie } from "src/domain/entities";

@Injectable()
export class SettlementUseCase {

    constructor(
        @Inject(SETTLEMENT_REPOSITORY) private readonly settlementRepository: SettlementRepository,
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
        @Inject(EXPENSE_SHARE_REPOSITORY) private readonly expenseShareRepository: ExpenseShareRepository,
        @Inject(ROOMIE_HOUSE_REPOSITORY) private readonly roomieHouseRepository: RoomieHouseRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
        private readonly personalFinanceSyncService: PersonalFinanceSyncService,
    ) { }

    async createSettlement(createSettlementDto: SettlementCreateRequestDto, auth0Sub: string): Promise<SettlementResponseDto> {
        // Obtener el creador
        const creator = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!creator) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        //validar que el creador pertenezca a la casa
        const creatorMembership = await this.roomieHouseRepository.findByRoomieAndHouse(creator.id, createSettlementDto.houseId);
        if (!creatorMembership) {
            throw new BadRequestException(`Roomie ${creator.id} is not an active member of house ${createSettlementDto.houseId}`);
        }

        // Obtener el roomie por auth0Sub
        const fromRoomie = await this.roomieRepository.findById(createSettlementDto.fromRoomieId);
        if (!fromRoomie) {
            throw new NotFoundException(`User with id ${createSettlementDto.fromRoomieId} not found`);
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
            createSettlementDto.date || new Date(),
            createSettlementDto.houseId,
            undefined,
            createSettlementDto.description,
            undefined
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
                // Este roomie pagó - aumenta el balance hacia 0 (reduce la deuda)
                balances[settlement.toRoomieId] = (balances[settlement.toRoomieId] || 0) + settlement.amount;
            } else if (settlement.toRoomieId === roomieId) {
                // Este roomie recibió - disminuye lo que el otro te debe
                balances[settlement.fromRoomieId] = (balances[settlement.fromRoomieId] || 0) - settlement.amount;
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
        response.date = settlement.date;
        response.description = settlement.description;
        response.houseId = settlement.houseId;
        response.createdAt = settlement.createdAt;
        return response;
    }

    async updateSettlement(id: number, update: SettlementUpdateRequestDto, auth0Sub: string): Promise<SettlementResponseDto> {
        // Editor must exist
        const editor = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!editor) throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);

        // Load existing settlement
        const existing = await this.settlementRepository.findById(id);
        if (!existing) throw new NotFoundException(`Settlement with ID ${id} not found`);

        // Editor must belong to the house
        const membership = await this.roomieHouseRepository.findByRoomieAndHouse(editor.id, existing.houseId);
        if (!membership) throw new BadRequestException(`Roomie ${editor.id} is not an active member of house ${existing.houseId}`);

        // Apply allowed changes
        const newAmount = update.amount ?? existing.amount;
        if (newAmount <= 0) throw new BadRequestException('Settlement amount must be positive');

        const newFromRoomieId = update.fromRoomieId ?? existing.fromRoomieId;
        const newToRoomieId = update.toRoomieId ?? existing.toRoomieId;
        if (newToRoomieId === newFromRoomieId) {
            throw new BadRequestException('Cannot set receiver equal to payer');
        }

        // Validate payer membership if changed
        if (newFromRoomieId !== existing.fromRoomieId) {
            const fromMembership = await this.roomieHouseRepository.findByRoomieAndHouse(newFromRoomieId, existing.houseId);
            if (!fromMembership) throw new BadRequestException(`Roomie ${newFromRoomieId} is not an active member of house ${existing.houseId}`);
        }

        // Validate receiver membership if changed
        if (newToRoomieId !== existing.toRoomieId) {
            const toMembership = await this.roomieHouseRepository.findByRoomieAndHouse(newToRoomieId, existing.houseId);
            if (!toMembership) throw new BadRequestException(`Roomie ${newToRoomieId} is not an active member of house ${existing.houseId}`);
        }

        const updated = Settlement.create(
            newFromRoomieId,
            newToRoomieId,
            newAmount,
            update.date ?? existing.date,
            existing.houseId,
            existing.id,
            update.description ?? existing.description,
            existing.createdAt
        );

        const saved = await this.settlementRepository.save(updated);
        return this.mapToSettlementResponse(saved);
    }

    async getSettlementById(id: number): Promise<FinancialActivityResponseDto> {
        const settlement = await this.settlementRepository.findById(id);
        if (!settlement) {
            throw new NotFoundException(`Settlement with ID ${id} not found`);
        }
        const toRoomie = await this.roomieRepository.findById(settlement.toRoomieId);
        if (!toRoomie) {
            throw new NotFoundException(`Roomie with ID ${settlement.toRoomieId} not found`);
        }
        const fromRoomie = await this.roomieRepository.findById(settlement.fromRoomieId);
        if (!fromRoomie) {
            throw new NotFoundException(`Roomie with ID ${settlement.fromRoomieId} not found`);
        }
        return this.mapToFinancialActivityResponse(settlement, toRoomie!, fromRoomie!);
    }

    private mapToFinancialActivityResponse(settlement: Settlement, toRoomie: Roomie, fromRoomie: Roomie): FinancialActivityResponseDto {
        return new FinancialActivityResponseDto(
            settlement.id,
            "settlement",
            false,
            null,
            settlement.amount,
            settlement.date,
            settlement.description,
            fromRoomie.name,
            fromRoomie.picture,
            toRoomie.name,
            toRoomie.picture,
            fromRoomie.id,
            toRoomie.id
        );
    }
}
