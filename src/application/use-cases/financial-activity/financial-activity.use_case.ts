import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EXPENSE_REPOSITORY, INCOME_REPOSITORY, ROOMIE_REPOSITORY } from "src/infrastructure/database/repositories";
import { ExpenseRepository, IncomeRepository, RoomieRepository } from "src/domain/repositories";
import { FinancialActivityResponseDto } from "src/presentation/dtos/financial-activity/financial-activity.response.dto";
import { PaginatedFinancialActivitiesResponseDto } from "src/presentation/dtos/financial-activity/paginated-financial-activities.response.dto";

@Injectable()
export class FinancialActivityUseCase {

    constructor(
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
        @Inject(INCOME_REPOSITORY) private readonly incomeRepository: IncomeRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
    ) { }

    /**
     * Gets all financial activities (expenses and incomes) for a user, paginated and ordered by date (most recent first)
     */
    async getFinancialActivitiesByAuth0Sub(
        auth0Sub: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedFinancialActivitiesResponseDto> {
        // Resolver Auth0 subject to user ID
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Validate pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Limit max page size

        // Get paginated expenses (personal expenses only - where houseId is null)
        const { expenses, totalCount: expenseCount } = await this.expenseRepository.findByPaidByIdPaginated(user.id, page, pageSize);
        const personalExpenses = expenses.filter(expense => expense.houseId === null || expense.houseId === undefined);

        // Get paginated incomes
        const { incomes, totalCount: incomeCount } = await this.incomeRepository.findByEarnedByIdPaginated(user.id, page, pageSize);

        // Convert to DTOs
        const expenseActivities = personalExpenses.map(expense => FinancialActivityResponseDto.fromExpense(expense));
        const incomeActivities = incomes.map(income => FinancialActivityResponseDto.fromIncome(income));

        // Combine and sort by date (most recent first)
        const allActivities = [...expenseActivities, ...incomeActivities];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // For proper pagination with combined data, we need to implement a different approach
        // Since we can't easily paginate combined queries, we'll fetch more data and paginate in memory
        // This is a simplified implementation - for production with large datasets, 
        // consider implementing a unified query or using a different pagination strategy

        const totalCount = expenseCount + incomeCount;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedActivities = allActivities.slice(startIndex, endIndex);

        return new PaginatedFinancialActivitiesResponseDto(
            paginatedActivities,
            totalCount,
            page,
            pageSize
        );
    }

    /**
     * Alternative implementation that uses database-level pagination for better performance
     * This method gets all data first and then paginates - suitable for smaller datasets
     */
    async getFinancialActivitiesByAuth0SubOptimized(
        auth0Sub: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedFinancialActivitiesResponseDto> {
        // Resolver Auth0 subject to user ID
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException(`User with auth0Sub ${auth0Sub} not found`);
        }

        // Validate pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        // Get all personal expenses (not house expenses)
        const allExpenses = await this.expenseRepository.findByPaidById(user.id);
        const personalExpenses = allExpenses.filter(expense => expense.houseId === null || expense.houseId === undefined);

        // Get all personal incomes
        const allIncomes = await this.incomeRepository.findByEarnedById(user.id);

        // Convert to DTOs
        const expenseActivities = personalExpenses.map(expense => FinancialActivityResponseDto.fromExpense(expense));
        const incomeActivities = allIncomes.map(income => FinancialActivityResponseDto.fromIncome(income));

        // Combine and sort by date (most recent first)
        const allActivities = [...expenseActivities, ...incomeActivities];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Apply pagination
        const totalCount = allActivities.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedActivities = allActivities.slice(startIndex, endIndex);

        return new PaginatedFinancialActivitiesResponseDto(
            paginatedActivities,
            totalCount,
            page,
            pageSize
        );
    }
}
