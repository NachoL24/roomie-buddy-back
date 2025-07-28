import { Inject, Injectable } from '@nestjs/common';
import { ExpenseRepository, IncomeRepository } from 'src/domain/repositories';
import { Expense } from 'src/domain/entities/expense.entity';
import { Income } from 'src/domain/entities/income.entity';
import { EXPENSE_REPOSITORY, INCOME_REPOSITORY } from 'src/infrastructure/database/repositories';

@Injectable()
export class PersonalFinanceSyncService {
    constructor(
        @Inject(EXPENSE_REPOSITORY)
        private readonly expenseRepository: ExpenseRepository,
        @Inject(INCOME_REPOSITORY)
        private readonly incomeRepository: IncomeRepository,
    ) { }

    /**
     * Sincroniza un expense grupal con las finanzas personales
     * Solo se registra como gasto personal para quien pagó (paidById)
     */
    async syncExpenseToPersonalFinances(expense: any): Promise<void> {
        try {
            // Crear expense personal para quien pagó
            const personalExpense = Expense.create(
                expense.amount,
                expense.date,
                expense.paidById,
                undefined, // houseId = undefined para finanzas personales
                undefined,
                `Group expense: ${expense.description || 'Shared expense'}`
            );

            await this.expenseRepository.save(personalExpense);

            console.log(`Personal expense created for group expense ${expense.id} - User ${expense.paidById} - Amount: $${expense.amount}`);
        } catch (error) {
            console.error(`Error syncing expense ${expense.id} to personal finances:`, error);
            throw error;
        }
    }

    /**
     * Sincroniza un settlement con las finanzas personales
     * Crea un gasto para quien envía y un ingreso para quien recibe
     */
    async syncSettlementToPersonalFinances(settlement: any): Promise<void> {
        try {
            // Crea un expense para el que paga
            const expense = Expense.create(
                settlement.amount,
                settlement.createdAt || new Date(),
                settlement.fromRoomieId,
                undefined, // houseId = undefined para indicarlo como personal
                undefined,
                `Settlement to roomie ${settlement.toRoomieId}: ${settlement.description || 'Payment'}`
            );
            await this.expenseRepository.save(expense);

            // Crea un ingreso para el que recibe
            const income = Income.create(
                `Payment received from roomie ${settlement.fromRoomieId}: ${settlement.description || 'Settlement'}`,
                settlement.amount,
                settlement.toRoomieId,
                undefined, // houseId = undefined para indicarlo como personal
                settlement.createdAt || new Date()
            );
            await this.incomeRepository.save(income);

            console.log(`Personal finances updated for settlement between ${settlement.fromRoomieId} and ${settlement.toRoomieId}`);
        } catch (error) {
            console.error(`Error syncing settlement ${settlement.id} to personal finances:`, error);
            throw error;
        }
    }

    /**
     * Sincroniza un income con las finanzas personales
     * Los ingresos ya están registrados directamente
     */
    async syncIncomeToPersonalFinances(income: any): Promise<void> {
        // Los ingresos ya se crean con houseId cuando es necesario
        // Solo necesitamos asegurar que los ingresos personales tengan houseId = null
        console.log(`Income sync not needed - incomes are already personal by nature`);
    }

    /**
     * Obtiene todas las finanzas personales de un usuario (expenses con houseId = null o undefined)
     */
    async getPersonalExpenses(userId: number): Promise<Expense[]> {
        const expenses = await this.expenseRepository.findByPaidById(userId);
        return expenses.filter(expense => expense.houseId === null || expense.houseId === undefined);
    }

    /**
     * Obtiene todos los ingresos personales de un usuario (incomes con houseId = null o undefined)
     */
    async getPersonalIncomes(userId: number): Promise<Income[]> {
        const incomes = await this.incomeRepository.findByEarnedById(userId);
        return incomes.filter(income => income.houseId === null || income.houseId === undefined);
    }

    /**
     * Calcula el resumen financiero personal de un usuario
     */
    async getPersonalFinancialSummary(userId: number): Promise<{ totalIncome: number; totalExpenses: number; netBalance: number }> {
        const personalExpenses = await this.getPersonalExpenses(userId);
        const personalIncomes = await this.getPersonalIncomes(userId);

        const totalExpenses = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalIncome = personalIncomes.reduce((sum, income) => sum + income.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        return {
            totalIncome,
            totalExpenses,
            netBalance
        };
    }
}
