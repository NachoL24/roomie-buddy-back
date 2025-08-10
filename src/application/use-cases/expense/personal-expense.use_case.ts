import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EXPENSE_REPOSITORY, INCOME_REPOSITORY, ROOMIE_REPOSITORY } from "src/infrastructure/database/repositories";
import { Expense } from "src/domain/entities/expense.entity";
import { ExpenseRepository, IncomeRepository, RoomieRepository } from "src/domain/repositories";
import { PersonalExpenseCreateRequestDto } from "src/presentation/dtos/expense/personal-expense-create.request.dto";
import { PersonalExpenseUpdateRequestDto } from "src/presentation/dtos/expense/personal-expense-update.request.dto";
import { PersonalExpenseResponseDto } from "src/presentation/dtos/expense/personal-expense.response.dto";
import { PersonalFinancialSummaryResponseDto } from "src/presentation/dtos/expense/personal-financial-summary.response.dto";

@Injectable()
export class PersonalExpenseUseCase {

    constructor(
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
        @Inject(INCOME_REPOSITORY) private readonly incomeRepository: IncomeRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
    ) { }

    // Auth0 subject helper methods

    /**
     * Crea un gasto personal usando Auth0 subject
     */
    async createPersonalExpenseByAuth0Sub(createExpenseDto: PersonalExpenseCreateRequestDto, auth0Sub: string): Promise<PersonalExpenseResponseDto> {
        // Resolver Auth0 subject a user ID
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.createPersonalExpense(createExpenseDto, user.id);
    }

    /**
     * Obtiene gastos personales por Auth0 subject
     */
    async getPersonalExpensesByAuth0Sub(auth0Sub: string): Promise<PersonalExpenseResponseDto[]> {
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.getPersonalExpensesByUserId(user.id);
    }

    /**
     * Obtiene gasto personal por ID usando Auth0 subject
     */
    async getPersonalExpenseByIdAndAuth0Sub(expenseId: number, auth0Sub: string): Promise<PersonalExpenseResponseDto> {
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.getPersonalExpenseById(expenseId, user.id);
    }

    /**
     * Actualiza gasto personal usando Auth0 subject
     */
    async updatePersonalExpenseByAuth0Sub(
        expenseId: number,
        auth0Sub: string,
        updateExpenseDto: PersonalExpenseUpdateRequestDto
    ): Promise<PersonalExpenseResponseDto> {
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.updatePersonalExpense(expenseId, user.id, updateExpenseDto);
    }

    /**
     * Elimina gasto personal usando Auth0 subject
     */
    async deletePersonalExpenseByAuth0Sub(expenseId: number, auth0Sub: string): Promise<void> {
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.deletePersonalExpense(expenseId, user.id);
    }

    /**
     * Obtiene gastos personales por rango de fechas usando Auth0 subject
     */
    async getPersonalExpensesByDateRangeAndAuth0Sub(
        auth0Sub: string,
        startDate: Date,
        endDate: Date
    ): Promise<PersonalExpenseResponseDto[]> {
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.getPersonalExpensesByDateRange(user.id, startDate, endDate);
    }

    /**
     * Obtiene resumen simple de gastos personales usando Auth0 subject
     */
    async getPersonalExpenseSummaryByAuth0Sub(auth0Sub: string): Promise<{
        totalExpenses: number;
        expenseCount: number;
        averageExpense: number
    }> {
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.getPersonalExpenseSummary(user.id);
    }

    // Original methods with user ID

    async createPersonalExpense(createExpenseDto: PersonalExpenseCreateRequestDto, paidById: number): Promise<PersonalExpenseResponseDto> {
        // Crear expense personal (sin houseId)
        const expense = Expense.create(
            createExpenseDto.amount,
            createExpenseDto.date,
            paidById,
            undefined, // houseId = undefined para gastos personales
            undefined, // id será asignado por la base de datos
            createExpenseDto.description
        );

        const savedExpense = await this.expenseRepository.save(expense);

        return this.mapToPersonalExpenseResponse(savedExpense);
    }

    async getPersonalExpenseById(expenseId: number, userId: number): Promise<PersonalExpenseResponseDto> {
        const expense = await this.expenseRepository.findById(expenseId);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Verificar que es un gasto personal y pertenece al usuario
        if (expense.houseId !== null && expense.houseId !== undefined) {
            throw new NotFoundException(`Expense with ID ${expenseId} is not a personal expense`);
        }

        if (expense.paidById !== userId) {
            throw new NotFoundException(`Personal expense with ID ${expenseId} does not belong to user ${userId}`);
        }

        return this.mapToPersonalExpenseResponse(expense);
    }

    async getPersonalExpensesByUserId(userId: number): Promise<PersonalExpenseResponseDto[]> {
        const expenses = await this.expenseRepository.findByPaidById(userId);
        console.log("expenses ", expenses);
        // Filtrar solo gastos personales (sin houseId)
        // const personalExpenses = expenses.filter(expense =>
        //     expense.houseId === null || expense.houseId === undefined
        // );

        return expenses.map(expense => this.mapToPersonalExpenseResponse(expense));
    }

    async updatePersonalExpense(
        expenseId: number,
        userId: number,
        updateExpenseDto: PersonalExpenseUpdateRequestDto
    ): Promise<PersonalExpenseResponseDto> {
        const existingExpense = await this.expenseRepository.findById(expenseId);
        if (!existingExpense) {
            throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Verificar que es un gasto personal y pertenece al usuario
        if (existingExpense.houseId !== null && existingExpense.houseId !== undefined) {
            throw new NotFoundException(`Expense with ID ${expenseId} is not a personal expense`);
        }

        if (existingExpense.paidById !== userId) {
            throw new NotFoundException(`Personal expense with ID ${expenseId} does not belong to user ${userId}`);
        }

        // Crear expense actualizado
        const updatedExpense = Expense.create(
            updateExpenseDto.amount ?? existingExpense.amount,
            updateExpenseDto.date ?? existingExpense.date,
            existingExpense.paidById, // No se puede cambiar el propietario
            undefined, // Mantener como gasto personal
            existingExpense.id,
            updateExpenseDto.description ?? existingExpense.description,
            existingExpense.createdAt,
            new Date()
        );

        const savedExpense = await this.expenseRepository.save(updatedExpense);

        return this.mapToPersonalExpenseResponse(savedExpense);
    }

    async deletePersonalExpense(expenseId: number, userId: number): Promise<void> {
        const expense = await this.expenseRepository.findById(expenseId);
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Verificar que es un gasto personal y pertenece al usuario
        if (expense.houseId !== null && expense.houseId !== undefined) {
            throw new NotFoundException(`Expense with ID ${expenseId} is not a personal expense`);
        }

        if (expense.paidById !== userId) {
            throw new NotFoundException(`Personal expense with ID ${expenseId} does not belong to user ${userId}`);
        }

        await this.expenseRepository.delete(expenseId);
    }

    async getPersonalExpensesByDateRange(
        userId: number,
        startDate: Date,
        endDate: Date
    ): Promise<PersonalExpenseResponseDto[]> {
        const expenses = await this.expenseRepository.findByPaidById(userId);

        // Filtrar gastos personales por rango de fechas
        const filteredExpenses = expenses.filter(expense =>
            (expense.houseId === null || expense.houseId === undefined) &&
            expense.date >= startDate &&
            expense.date <= endDate
        );

        return filteredExpenses.map(expense => this.mapToPersonalExpenseResponse(expense));
    }

    async getPersonalExpenseSummary(userId: number): Promise<{
        totalExpenses: number;
        expenseCount: number;
        averageExpense: number
    }> {
        const personalExpenses = await this.getPersonalExpensesByUserId(userId);

        const totalExpenses = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const expenseCount = personalExpenses.length;
        const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

        return {
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            expenseCount,
            averageExpense: Math.round(averageExpense * 100) / 100
        };
    }

    /**
     * Obtiene resumen financiero personal completo con gastos e ingresos
     * Por default: desde el 1 del mes actual hasta hoy
     */
    async getPersonalFinancialSummaryByAuth0Sub(
        auth0Sub: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<PersonalFinancialSummaryResponseDto> {
        // Resolver Auth0 subject a user ID
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return this.getPersonalFinancialSummary(user.id, startDate, endDate);
    }

    /**
     * Obtiene resumen financiero personal completo con gastos e ingresos
     * Por default: desde el 1 del mes actual hasta hoy
     */
    async getPersonalFinancialSummary(
        userId: number,
        startDate?: Date,
        endDate?: Date
    ): Promise<PersonalFinancialSummaryResponseDto> {
        // Si no se especifican fechas, usar desde el 1 del mes actual hasta hoy
        const now = new Date();
        const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        const defaultEndDate = endDate || now;

        // Obtener gastos personales del período
        const allPersonalExpenses = await this.getPersonalExpensesByUserId(userId);
        const periodExpenses = allPersonalExpenses.filter(expense =>
            expense.date >= defaultStartDate && expense.date <= defaultEndDate
        );

        // Obtener ingresos personales del período (ingresos sin houseId)
        const allIncomes = await this.incomeRepository.findByEarnedById(userId);
        
        const personalIncomes = allIncomes.filter(income =>
            income.houseId === null || income.houseId === undefined
        );
        const periodIncomes = personalIncomes.filter(income =>
            income.earnedAt >= defaultStartDate && income.earnedAt <= defaultEndDate
        );

        // Calcular totales del período
        const currentMonthExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const currentMonthIncome = periodIncomes.reduce((sum, income) => sum + income.amount, 0);

        // Calcular balance total acumulado (todos los gastos e ingresos personales)
        const totalPersonalExpenses = allPersonalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalPersonalIncome = personalIncomes.reduce((sum, income) => sum + income.amount, 0);
        const totalBalance = totalPersonalIncome - totalPersonalExpenses;

        return PersonalFinancialSummaryResponseDto.create(
            currentMonthExpenses,
            currentMonthIncome,
            totalBalance,
            defaultStartDate,
            defaultEndDate,
            periodExpenses.length,
            periodIncomes.length
        );
    }

    private mapToPersonalExpenseResponse(expense: Expense): PersonalExpenseResponseDto {
        const response = new PersonalExpenseResponseDto();
        response.id = expense.id;
        response.description = expense.description;
        response.amount = expense.amount;
        response.date = expense.date;
        response.createdAt = expense.createdAt;
        response.updatedAt = expense.updatedAt;
        response.paidById = expense.paidById;
        return response;
    }
}
