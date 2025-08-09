import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileCompletedGuard } from '../guards/profile-completed.guard';
import { User } from 'src/presentation/decorators/user.decorator';
import { AuthenticatedUserDto } from 'src/application/dto/user/authenticated-user.dto';
import { FinancialActivityUseCase } from 'src/application/use-cases/financial-activity/financial-activity.use_case';
import { PaginatedFinancialActivitiesResponseDto } from 'src/presentation/dtos/financial-activity/paginated-financial-activities.response.dto';

@Controller('financial-activities')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class FinancialActivityController {
    constructor(
        private readonly financialActivityUseCase: FinancialActivityUseCase
    ) { }

    /**
     * Get all financial activities (expenses and incomes) for the authenticated user
     * GET /financial-activities?page=1&pageSize=10
     */
    @Get()
    async getFinancialActivities(
        @User() user: AuthenticatedUserDto,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number = 10
    ): Promise<PaginatedFinancialActivitiesResponseDto> {
        return await this.financialActivityUseCase.getFinancialActivitiesByAuth0SubOptimized(
            user.sub,
            page,
            pageSize
        );
    }
}
