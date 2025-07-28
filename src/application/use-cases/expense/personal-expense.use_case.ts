import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EXPENSE_REPOSITORY } from "src/infrastructure/database/repositories";
import { Expense } from "src/domain/entities/expense.entity";
import { ExpenseRepository } from "src/domain/repositories";
import { PersonalExpenseCreateRequestDto } from "src/presentation/dtos/expense/personal-expense-create.request.dto";
import { PersonalExpenseUpdateRequestDto } from "src/presentation/dtos/expense/personal-expense-update.request.dto";
import { PersonalExpenseResponseDto } from "src/presentation/dtos/expense/personal-expense.response.dto";

@Injectable()
export class PersonalExpenseUseCase {

    constructor(
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
    ) { }

    async createPersonalExpense(createExpenseDto: PersonalExpenseCreateRequestDto): Promise<PersonalExpenseResponseDto> {
        // Crear expense personal (sin houseId)
        const expense = Expense.create(
            createExpenseDto.amount,
            createExpenseDto.date,
            createExpenseDto.paidById,
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

        // Filtrar solo gastos personales (sin houseId)
        const personalExpenses = expenses.filter(expense =>
            expense.houseId === null || expense.houseId === undefined
        );

        return personalExpenses.map(expense => this.mapToPersonalExpenseResponse(expense));
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
