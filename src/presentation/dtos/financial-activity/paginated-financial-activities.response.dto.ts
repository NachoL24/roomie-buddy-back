import { FinancialActivityResponseDto } from './financial-activity.response.dto';

export class PaginatedFinancialActivitiesResponseDto {
    activities: FinancialActivityResponseDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;

    constructor(
        activities: FinancialActivityResponseDto[],
        totalCount: number,
        page: number,
        pageSize: number
    ) {
        this.activities = activities;
        this.totalCount = totalCount;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = Math.ceil(totalCount / pageSize);
        this.hasNextPage = page < this.totalPages;
        this.hasPreviousPage = page > 1;
    }
}
