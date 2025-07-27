import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { EXPENSE_REPOSITORY, EXPENSE_SHARE_REPOSITORY, ROOMIE_HOUSE_REPOSITORY } from "src/infrastructure/database/repositories";
import { Expense } from "src/domain/entities/expense.entity";
import { ExpenseShare } from "src/domain/entities/expense-share.entity";
import { ExpenseRepository, ExpenseShareRepository, RoomieHouseRepository } from "src/domain/repositories";
import { ExpenseCreateRequestDto } from "src/presentation/dtos/expense/expense-create.request.dto";
import { ExpenseUpdateRequestDto } from "src/presentation/dtos/expense/expense-update.request.dto";
import { ExpenseResponseDto } from "src/presentation/dtos/expense/expense.response.dto";
import { ExpenseWithSharesResponseDto } from "src/presentation/dtos/expense/expense-with-shares.response.dto";
import { ExpenseShareResponseDto } from "src/presentation/dtos/expense/expense-share.response.dto";
import { ExpenseSummaryResponseDto } from "src/presentation/dtos/expense/expense-summary.response.dto";

@Injectable()
export class ExpenseUseCase {

    constructor(
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
        @Inject(EXPENSE_SHARE_REPOSITORY) private readonly expenseShareRepository: ExpenseShareRepository,
        @Inject(ROOMIE_HOUSE_REPOSITORY) private readonly roomieHouseRepository: RoomieHouseRepository,
    ) { }

    async createExpense(createExpenseDto: ExpenseCreateRequestDto): Promise<ExpenseWithSharesResponseDto> {
        // Verificar que la casa tiene al menos un miembro activo
        const houseMembers = await this.roomieHouseRepository.findByHouseId(createExpenseDto.houseId);
        if (houseMembers.length === 0) {
            throw new BadRequestException(`House ${createExpenseDto.houseId} has no active members. Cannot create expense.`);
        }

        // Verificar que el pagador es miembro activo de la casa
        const paidByMembership = await this.roomieHouseRepository.findByRoomieAndHouse(
            createExpenseDto.paidById,
            createExpenseDto.houseId
        );
        if (!paidByMembership) {
            throw new BadRequestException(`Roomie ${createExpenseDto.paidById} is not an active member of house ${createExpenseDto.houseId}. Cannot create expense.`);
        }

        // VALIDAR TODO ANTES DE CREAR CUALQUIER COSA
        if (createExpenseDto.expenseShares && createExpenseDto.expenseShares.length > 0) {
            // Validar expense shares si se proporcionan
            await this.validateExpenseShares(createExpenseDto.expenseShares, createExpenseDto.amount, createExpenseDto.houseId);
        }

        // Crear el expense SOLO después de validar todo
        const expense = Expense.create(
            createExpenseDto.amount,
            createExpenseDto.date,
            createExpenseDto.paidById,
            createExpenseDto.houseId,
            undefined, // id será asignado por la base de datos
            createExpenseDto.description
        );

        const savedExpense = await this.expenseRepository.save(expense);

        let expenseShares: ExpenseShare[] = [];

        if (createExpenseDto.expenseShares && createExpenseDto.expenseShares.length > 0) {
            // Crear expense shares (ya validadas anteriormente)
            expenseShares = await this.createExpenseShares(savedExpense.id, createExpenseDto.expenseShares);
        } else {
            // Dividir equitativamente entre todos los miembros activos según payRatio
            expenseShares = await this.createEqualExpenseShares(savedExpense.id, createExpenseDto.houseId, createExpenseDto.amount);
        }

        return this.mapToExpenseWithSharesResponse(savedExpense, expenseShares);
    }

    async getExpenseById(expenseId: number): Promise<ExpenseWithSharesResponseDto> {
        const expense = await this.expenseRepository.findById(expenseId);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        const expenseShares = await this.expenseShareRepository.findByExpenseId(expenseId);
        return this.mapToExpenseWithSharesResponse(expense, expenseShares);
    }

    async getExpensesByHouseId(houseId: number): Promise<ExpenseWithSharesResponseDto[]> {
        const expenses = await this.expenseRepository.findByHouseId(houseId);

        const expensesWithShares = await Promise.all(
            expenses.map(async (expense) => {
                const expenseShares = await this.expenseShareRepository.findByExpenseId(expense.id);
                return this.mapToExpenseWithSharesResponse(expense, expenseShares);
            })
        );

        return expensesWithShares;
    }

    async updateExpense(expenseId: number, updateExpenseDto: ExpenseUpdateRequestDto): Promise<ExpenseWithSharesResponseDto> {
        const existingExpense = await this.expenseRepository.findById(expenseId);
        if (!existingExpense) {
            throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Verificar que el pagador sigue siendo miembro activo de la casa si se cambia
        if (updateExpenseDto.paidById) {
            const paidByMembership = await this.roomieHouseRepository.findByRoomieAndHouse(
                updateExpenseDto.paidById,
                existingExpense.houseId
            );
            if (!paidByMembership) {
                throw new BadRequestException(`Cannot update expense. Roomie ${updateExpenseDto.paidById} is not an active member of house ${existingExpense.houseId}`);
            }
        }

        // VALIDAR TODO ANTES DE ACTUALIZAR CUALQUIER COSA
        if (updateExpenseDto.expenseShares) {
            // Validar expense shares si se van a actualizar
            const finalAmount = updateExpenseDto.amount ?? existingExpense.amount;
            await this.validateExpenseShares(updateExpenseDto.expenseShares, finalAmount, existingExpense.houseId);
        }

        // Crear expense actualizado SOLO después de validar todo
        const updatedExpense = Expense.create(
            updateExpenseDto.amount ?? existingExpense.amount,
            updateExpenseDto.date ?? existingExpense.date,
            updateExpenseDto.paidById ?? existingExpense.paidById,
            existingExpense.houseId,
            existingExpense.id,
            updateExpenseDto.description ?? existingExpense.description,
            existingExpense.createdAt,
            new Date()
        );

        const savedExpense = await this.expenseRepository.save(updatedExpense);

        // Si se actualizan las expense shares, eliminar las existentes y crear nuevas
        if (updateExpenseDto.expenseShares) {
            // Eliminar expense shares existentes
            const existingShares = await this.expenseShareRepository.findByExpenseId(expenseId);
            await Promise.all(existingShares.map(share => this.expenseShareRepository.delete(share.id)));

            // Crear nuevas expense shares (ya validadas anteriormente)
            const newExpenseShares = await this.createExpenseShares(savedExpense.id, updateExpenseDto.expenseShares);

            return this.mapToExpenseWithSharesResponse(savedExpense, newExpenseShares);
        } else {
            // Mantener las expense shares existentes
            const expenseShares = await this.expenseShareRepository.findByExpenseId(expenseId);
            return this.mapToExpenseWithSharesResponse(savedExpense, expenseShares);
        }
    }

    async deleteExpense(expenseId: number): Promise<void> {
        const expense = await this.expenseRepository.findById(expenseId);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Eliminar expense shares asociadas
        const expenseShares = await this.expenseShareRepository.findByExpenseId(expenseId);
        await Promise.all(expenseShares.map(share => this.expenseShareRepository.delete(share.id)));

        // Eliminar expense
        await this.expenseRepository.delete(expenseId);
    }

    async getExpensesByRoomieId(roomieId: number): Promise<ExpenseWithSharesResponseDto[]> {
        // Obtener gastos pagados por el roomie
        const paidExpenses = await this.expenseRepository.findByPaidById(roomieId);

        // Obtener expense shares del roomie
        const roomieShares = await this.expenseShareRepository.findByRoomieId(roomieId);
        const sharedExpenseIds = [...new Set(roomieShares.map(share => share.expenseId))];

        // Obtener gastos en los que participa pero no pagó
        const sharedExpensePromises = sharedExpenseIds.map(expenseId => this.expenseRepository.findById(expenseId));
        const sharedExpensesResults = await Promise.all(sharedExpensePromises);
        const validSharedExpenses = sharedExpensesResults
            .filter((expense): expense is Expense => expense !== null && expense.paidById !== roomieId);

        // Combinar ambos tipos de gastos
        const allExpenses = [...paidExpenses, ...validSharedExpenses];
        const uniqueExpenses = allExpenses.filter((expense, index, self) =>
            index === self.findIndex(e => e.id === expense.id)
        );

        const expensesWithShares = await Promise.all(
            uniqueExpenses.map(async (expense) => {
                const expenseShares = await this.expenseShareRepository.findByExpenseId(expense.id);
                return this.mapToExpenseWithSharesResponse(expense, expenseShares);
            })
        );

        return expensesWithShares;
    }

    async getExpensesByDateRange(houseId: number, startDate: Date, endDate: Date): Promise<ExpenseWithSharesResponseDto[]> {
        // Primero obtener todos los gastos de la casa
        const houseExpenses = await this.expenseRepository.findByHouseId(houseId);

        // Filtrar por rango de fechas
        const filteredExpenses = houseExpenses.filter(expense =>
            expense.date >= startDate && expense.date <= endDate
        );

        const expensesWithShares = await Promise.all(
            filteredExpenses.map(async (expense) => {
                const expenseShares = await this.expenseShareRepository.findByExpenseId(expense.id);
                return this.mapToExpenseWithSharesResponse(expense, expenseShares);
            })
        );

        return expensesWithShares;
    }

    async getExpenseSummaryByHouse(houseId: number): Promise<ExpenseSummaryResponseDto[]> {
        // Obtener todos los miembros activos de la casa
        const roomieHouses = await this.roomieHouseRepository.findByHouseId(houseId);

        if (roomieHouses.length === 0) {
            return [];
        }

        // Obtener todos los gastos de la casa
        const houseExpenses = await this.expenseRepository.findByHouseId(houseId);

        const summaries = await Promise.all(
            roomieHouses.map(async (roomieHouse) => {
                const roomieId = roomieHouse.roomieId;

                // Calcular total pagado por este roomie
                const paidExpenses = houseExpenses.filter(expense => expense.paidById === roomieId);
                const totalPaid = paidExpenses.reduce((sum, expense) => sum + expense.amount, 0);

                // Calcular total que debe este roomie
                const allExpenseShares = await Promise.all(
                    houseExpenses.map(expense => this.expenseShareRepository.findByExpenseId(expense.id))
                );
                const roomieShares = allExpenseShares
                    .flat()
                    .filter(share => share.roomieId === roomieId);
                const totalOwed = roomieShares.reduce((sum, share) => sum + share.shareAmount, 0);

                // Calcular balance (positivo = le deben, negativo = debe)
                const balance = totalPaid - totalOwed;

                // Contar número de gastos en los que participó
                const expenseCount = [...new Set(roomieShares.map(share => share.expenseId))].length;

                const summary = new ExpenseSummaryResponseDto();
                summary.roomieId = roomieId;
                summary.totalPaid = Math.round(totalPaid * 100) / 100;
                summary.totalOwed = Math.round(totalOwed * 100) / 100;
                summary.balance = Math.round(balance * 100) / 100;
                summary.expenseCount = expenseCount;

                return summary;
            })
        );

        return summaries;
    }

    private async validateExpenseShares(expenseShares: any[], totalAmount: number, houseId: number): Promise<void> {
        // Verificar que la suma de los montos sea igual al total
        const totalShares = expenseShares.reduce((sum, share) => sum + share.shareAmount, 0);
        if (Math.abs(totalShares - totalAmount) > 0.01) { // Tolerancia para decimales
            throw new BadRequestException(`The sum of expense shares (${totalShares}) must equal the total expense amount (${totalAmount})`);
        }

        // Verificar que todos los roomies sean miembros activos de la casa
        const roomieIds = expenseShares.map(share => share.roomieId);
        const uniqueRoomieIds = [...new Set(roomieIds)];

        if (roomieIds.length !== uniqueRoomieIds.length) {
            throw new BadRequestException("Duplicate roomie IDs found in expense shares");
        }

        const membershipPromises = uniqueRoomieIds.map(roomieId =>
            this.roomieHouseRepository.findByRoomieAndHouse(roomieId, houseId)
        );
        const memberships = await Promise.all(membershipPromises);

        const inactiveMemberIds = uniqueRoomieIds.filter((roomieId, index) => !memberships[index]);
        if (inactiveMemberIds.length > 0) {
            throw new BadRequestException(`Cannot create expense shares. The following roomies are not active members of house ${houseId}: ${inactiveMemberIds.join(', ')}`);
        }
    }

    private async createExpenseShares(expenseId: number, expenseShareDtos: any[]): Promise<ExpenseShare[]> {
        const expenseShares = expenseShareDtos.map(dto =>
            ExpenseShare.create(expenseId, dto.roomieId, dto.shareAmount)
        );

        const savedShares = await Promise.all(
            expenseShares.map(share => this.expenseShareRepository.save(share))
        );

        return savedShares;
    }

    private async createEqualExpenseShares(expenseId: number, houseId: number, totalAmount: number): Promise<ExpenseShare[]> {
        // Obtener todos los miembros activos de la casa
        const roomieHouses = await this.roomieHouseRepository.findByHouseId(houseId);

        if (roomieHouses.length === 0) {
            throw new BadRequestException(`No active members found in house ${houseId}`);
        }

        // Calcular el total de payRatios
        const totalPayRatio = roomieHouses.reduce((sum, roomieHouse) => sum + (roomieHouse.payRatio || 1), 0);

        // Crear expense shares basadas en payRatio
        const expenseShares = roomieHouses.map(roomieHouse => {
            const payRatio = roomieHouse.payRatio || 1;
            const shareAmount = (totalAmount * payRatio) / totalPayRatio;
            return ExpenseShare.create(expenseId, roomieHouse.roomieId, Math.round(shareAmount * 100) / 100); // Redondear a 2 decimales
        });

        const savedShares = await Promise.all(
            expenseShares.map(share => this.expenseShareRepository.save(share))
        );

        return savedShares;
    }

    private mapToExpenseWithSharesResponse(expense: Expense, expenseShares: ExpenseShare[]): ExpenseWithSharesResponseDto {
        const response = new ExpenseWithSharesResponseDto();
        response.id = expense.id;
        response.description = expense.description;
        response.amount = expense.amount;
        response.date = expense.date;
        response.createdAt = expense.createdAt;
        response.updatedAt = expense.updatedAt;
        response.paidById = expense.paidById;
        response.houseId = expense.houseId;
        response.expenseShares = expenseShares.map(share => ({
            id: share.id,
            expenseId: share.expenseId,
            roomieId: share.roomieId,
            shareAmount: share.shareAmount
        }));
        return response;
    }
}
