import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EXPENSE_REPOSITORY, HOUSE_REPO_TOKEN, INCOME_REPOSITORY, ROOMIE_REPOSITORY, SETTLEMENT_REPOSITORY } from "src/infrastructure/database/repositories";
import { ExpenseRepository, HouseRepository, IncomeRepository, RoomieRepository, SettlementRepository } from "src/domain/repositories";
import { FinancialActivityResponseDto } from "src/presentation/dtos/financial-activity/financial-activity.response.dto";
import { PaginatedFinancialActivitiesResponseDto } from "src/presentation/dtos/financial-activity/paginated-financial-activities.response.dto";

@Injectable()
export class FinancialActivityUseCase {

    constructor(
        @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
        @Inject(INCOME_REPOSITORY) private readonly incomeRepository: IncomeRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
        @Inject(SETTLEMENT_REPOSITORY) private readonly settlementRepository: SettlementRepository,
        @Inject(HOUSE_REPO_TOKEN) private readonly houseRepository: HouseRepository
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

        // Get settlements involving the user (no pagination here; we merge later)
        const settlements = await this.settlementRepository.findByRoomieId(user.id);

        // Get house information for activities
        const houseIds = [...new Set([
            ...personalExpenses.map(expense => expense.houseId),
            ...incomes.map(income => income.houseId),
            ...settlements.map(s => s.houseId)
        ])];
        // Fetch house names for the activities
        const houses = houseIds.length > 0 ? await Promise.all(houseIds.filter(id => id !== null && id !== undefined).map(id => this.houseRepository.findById(id))) : [];

        // Map house IDs to their names
        const houseIdToNameMap = new Map<number, string>();
        houses.forEach(house => {
            if (house) {
                houseIdToNameMap.set(house.id, house.name);
            }
        });

        // Convert to DTOs
        const expenseActivities = personalExpenses.map(expense => {
            const houseName = (expense.houseId !== null && expense.houseId !== undefined)
                ? (houseIdToNameMap.get(expense.houseId) ?? null)
                : null;
            return FinancialActivityResponseDto.fromExpense(expense, houseName);
        });
        const incomeActivities = incomes.map(income => {
            const houseName = (income.houseId !== null && income.houseId !== undefined)
                ? (houseIdToNameMap.get(income.houseId) ?? null)
                : null;
            return FinancialActivityResponseDto.fromIncome(income, houseName);
        });

        const settlementActivities = settlements.map(s => {
            const houseName = houseIdToNameMap.get(s.houseId) ?? null;
            return FinancialActivityResponseDto.fromSettlement(s, houseName);
        });


        // Combine and sort by date (most recent first)
        const allActivities = [...expenseActivities, ...incomeActivities, ...settlementActivities];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // For proper pagination with combined data, we need to implement a different approach
        // Since we can't easily paginate combined queries, we'll fetch more data and paginate in memory
        // This is a simplified implementation - for production with large datasets, 
        // consider implementing a unified query or using a different pagination strategy

        const totalCount = expenseCount + incomeCount + settlements.length;
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

        // Get all expenses and incomes (both personal and house)
        const allExpenses = await this.expenseRepository.findByPaidById(user.id);
        const allIncomes = await this.incomeRepository.findByEarnedById(user.id);
        const allSettlements = await this.settlementRepository.findByRoomieId(user.id);

        // Build houseId -> name map for any activity that references a house
        const houseIds = Array.from(new Set([
            ...allExpenses.map(e => e.houseId),
            ...allIncomes.map(i => i.houseId),
            ...allSettlements.map(s => s.houseId)
        ])).filter((id): id is number => id !== null && id !== undefined);

        const houses = houseIds.length > 0
            ? await Promise.all(houseIds.map(id => this.houseRepository.findById(id)))
            : [];

        const houseIdToNameMap = new Map<number, string>();
        houses.forEach(h => { if (h) houseIdToNameMap.set(h.id, h.name); });

        // Convert to DTOs with house names when available
        const expenseActivities = allExpenses.map(expense => {
            const houseName = (expense.houseId !== null && expense.houseId !== undefined)
                ? (houseIdToNameMap.get(expense.houseId) ?? null)
                : null;
            return FinancialActivityResponseDto.fromExpense(expense, houseName);
        });

        const incomeActivities = allIncomes.map(income => {
            const houseName = (income.houseId !== null && income.houseId !== undefined)
                ? (houseIdToNameMap.get(income.houseId) ?? null)
                : null;
            return FinancialActivityResponseDto.fromIncome(income, houseName);
        });

        const settlementActivities = allSettlements.map(s => {
            const houseName = houseIdToNameMap.get(s.houseId) ?? null;
            return FinancialActivityResponseDto.fromSettlement(s, houseName);
        });

        // Combine and sort by date (most recent first)
        const allActivities = [...expenseActivities, ...incomeActivities, ...settlementActivities];
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
