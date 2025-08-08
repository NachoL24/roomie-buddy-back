import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Income } from "src/domain/entities/income.entity";
import { IncomeRepository, RoomieRepository, ExpenseRepository } from "src/domain/repositories";
import { IncomeCreateRequestDto } from "src/presentation/dtos/income/income-create.request.dto";
import { IncomeUpdateRequestDto } from "src/presentation/dtos/income/income-update.request.dto";
import { IncomeResponseDto } from "src/presentation/dtos/income/income.response.dto";
import { FinancialSummaryResponseDto, MonthlyTrendDto } from "src/presentation/dtos/income/financial-summary.response.dto";
import { INCOME_REPOSITORY } from "src/infrastructure/database/repositories/income-repository.module";
import { ROOMIE_REPOSITORY } from "src/infrastructure/database/repositories/roomie-repository.module";
import { EXPENSE_REPOSITORY } from "src/infrastructure/database/repositories/expense-repository.module";

@Injectable()
export class IncomeUseCase {

    constructor(
        @Inject(INCOME_REPOSITORY) private readonly incomeRepository: IncomeRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository
    ) { }

    async createIncome(createIncomeDto: IncomeCreateRequestDto, auth0Sub: string): Promise<IncomeResponseDto> {
        // Obtener el roomie por auth0Sub
        const roomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!roomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Validar cantidad positiva
        if (createIncomeDto.amount <= 0) {
            throw new BadRequestException('Income amount must be positive');
        }

        // Crear el income personal (sin casa asociada)
        const income = Income.create(
            createIncomeDto.description,
            createIncomeDto.amount,
            roomie.id,
            undefined, // Los ingresos son personales, no asociados a una casa
            createIncomeDto.earnedAt,
            undefined, // id se asigna automáticamente
            createIncomeDto.isRecurring || false,
            createIncomeDto.recurrenceFrequency
        );

        const savedIncome = await this.incomeRepository.save(income);

        console.log(`Income created: ${savedIncome.id} - ${savedIncome.description} - $${savedIncome.amount} for roomie ${roomie.id}`);

        return IncomeResponseDto.create(savedIncome);
    }

    async getIncomesByHouseId(houseId: number): Promise<IncomeResponseDto[]> {
        const incomes = await this.incomeRepository.findByHouseId(houseId);
        return incomes.map(income => IncomeResponseDto.create(income));
    }

    async getIncomesByRoomieId(roomieId: number): Promise<IncomeResponseDto[]> {
        const incomes = await this.incomeRepository.findByEarnedById(roomieId);
        return incomes.map(income => IncomeResponseDto.create(income));
    }

    async getIncomesByAuth0Sub(auth0Sub: string): Promise<IncomeResponseDto[]> {
        const roomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!roomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        return await this.getIncomesByRoomieId(roomie.id);
    }

    async getIncomesByDateRange(houseId: number, startDate: Date, endDate: Date): Promise<IncomeResponseDto[]> {
        const incomes = await this.incomeRepository.findByHouseIdAndDateRange(houseId, startDate, endDate);
        return incomes.map(income => IncomeResponseDto.create(income));
    }

    async updateIncome(incomeId: number, updateIncomeDto: IncomeUpdateRequestDto, auth0Sub: string): Promise<IncomeResponseDto> {
        // Obtener el roomie por auth0Sub
        const roomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!roomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Obtener el income existente
        const existingIncome = await this.incomeRepository.findById(incomeId);
        if (!existingIncome) {
            throw new NotFoundException(`Income with ID ${incomeId} not found`);
        }

        // Validar que el roomie es el propietario del income
        if (existingIncome.earnedById !== roomie.id) {
            throw new BadRequestException('You can only update your own incomes');
        }

        // Validar cantidad positiva si se está actualizando
        if (updateIncomeDto.amount !== undefined && updateIncomeDto.amount <= 0) {
            throw new BadRequestException('Income amount must be positive');
        }

        // Crear income actualizado
        let updatedIncome = existingIncome;

        if (updateIncomeDto.description !== undefined) {
            updatedIncome = updatedIncome.updateDescription(updateIncomeDto.description);
        }

        if (updateIncomeDto.amount !== undefined) {
            updatedIncome = updatedIncome.updateAmount(updateIncomeDto.amount);
        }

        // Para otros campos, crear un nuevo income completo
        if (updateIncomeDto.earnedAt !== undefined ||
            updateIncomeDto.isRecurring !== undefined ||
            updateIncomeDto.recurrenceFrequency !== undefined) {

            updatedIncome = Income.create(
                updateIncomeDto.description || updatedIncome.description,
                updateIncomeDto.amount || updatedIncome.amount,
                updatedIncome.earnedById,
                updatedIncome.houseId,
                updateIncomeDto.earnedAt || updatedIncome.earnedAt,
                updatedIncome.id,
                updateIncomeDto.isRecurring !== undefined ? updateIncomeDto.isRecurring : updatedIncome.isRecurring,
                updateIncomeDto.recurrenceFrequency || updatedIncome.recurrenceFrequency,
                undefined, // nextRecurrenceDate se calcula automáticamente
                updatedIncome.createdAt
            );
        }

        const savedIncome = await this.incomeRepository.update(updatedIncome);

        console.log(`Income updated: ${savedIncome.id} - ${savedIncome.description} - $${savedIncome.amount}`);

        return IncomeResponseDto.create(savedIncome);
    }

    async deleteIncome(incomeId: number, auth0Sub: string): Promise<void> {
        // Obtener el roomie por auth0Sub
        const roomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!roomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Obtener el income existente
        const existingIncome = await this.incomeRepository.findById(incomeId);
        if (!existingIncome) {
            throw new NotFoundException(`Income with ID ${incomeId} not found`);
        }

        // Validar que el roomie es el propietario del income
        if (existingIncome.earnedById !== roomie.id) {
            throw new BadRequestException('You can only delete your own incomes');
        }

        await this.incomeRepository.delete(incomeId);

        console.log(`Income deleted: ${incomeId} by roomie ${roomie.id}`);
    }

    async getFinancialSummary(
        auth0Sub: string,
        periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' = 'MONTHLY',
        startDate?: Date,
        endDate?: Date
    ): Promise<FinancialSummaryResponseDto> {
        // Obtener el roomie por auth0Sub
        const roomie = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!roomie) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Calcular fechas del período
        const { start, end } = this.calculatePeriodDates(periodType, startDate, endDate);

        // Obtener ingresos personales del período
        const allIncomes = await this.incomeRepository.findByEarnedById(roomie.id);
        const incomes = allIncomes.filter(income =>
            income.earnedAt >= start && income.earnedAt <= end
        );

        // Obtener gastos personales del período
        const allExpenses = await this.expenseRepository.findByPaidById(roomie.id);
        const expenses = allExpenses.filter(expense =>
            expense.date >= start && expense.date <= end
        );

        // Calcular totales
        const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Agrupar por descripción (top 5)
        const topIncomeDescriptions = this.getTopDescriptions(incomes);
        const topExpenseDescriptions = this.getTopDescriptions(expenses);

        // Calcular tendencia mensual si es necesario
        const monthlyTrend = periodType !== 'MONTHLY' ? this.calculateMonthlyTrend(incomes, expenses, start, end) : undefined;

        return FinancialSummaryResponseDto.create(
            totalIncome,
            totalExpenses,
            periodType,
            start,
            end,
            topIncomeDescriptions,
            topExpenseDescriptions,
            monthlyTrend
        );
    }

    private calculatePeriodDates(
        periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM',
        startDate?: Date,
        endDate?: Date
    ): { start: Date; end: Date } {
        const now = new Date();
        let start: Date;
        let end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes actual

        switch (periodType) {
            case 'MONTHLY':
                start = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes actual
                break;
            case 'QUARTERLY':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'YEARLY':
                start = new Date(now.getFullYear(), 0, 1); // 1 de enero
                end = new Date(now.getFullYear(), 11, 31); // 31 de diciembre
                break;
            case 'CUSTOM':
                if (!startDate || !endDate) {
                    throw new BadRequestException('Start date and end date are required for custom period');
                }
                start = startDate;
                end = endDate;
                break;
        }

        return { start, end };
    }

    private getTopDescriptions(items: Income[] | any[]): { description: string; amount: number }[] {
        // Agrupar por descripción
        const grouped: { [description: string]: number } = {};

        items.forEach(item => {
            const description = item.description || 'Sin descripción';
            grouped[description] = (grouped[description] || 0) + item.amount;
        });

        // Convertir a array y ordenar por amount descendente
        return Object.entries(grouped)
            .map(([description, amount]) => ({ description, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5
    }

    private calculateMonthlyTrend(incomes: Income[], expenses: any[], startDate: Date, endDate: Date): MonthlyTrendDto[] {
        const trends: MonthlyTrendDto[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const monthIncomes = incomes.filter(income =>
                income.earnedAt.getMonth() === current.getMonth() &&
                income.earnedAt.getFullYear() === current.getFullYear()
            );

            const monthExpenses = expenses.filter(expense =>
                expense.createdAt.getMonth() === current.getMonth() &&
                expense.createdAt.getFullYear() === current.getFullYear()
            );

            const monthIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0);
            const monthExpense = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

            trends.push(new MonthlyTrendDto(
                current.toLocaleString('default', { month: 'long' }),
                current.getFullYear(),
                monthIncome,
                monthExpense
            ));

            current.setMonth(current.getMonth() + 1);
        }

        return trends;
    }
}
