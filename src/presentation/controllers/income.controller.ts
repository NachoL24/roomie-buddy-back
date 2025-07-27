import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfileCompletedGuard } from "../guards/profile-completed.guard";
import { User } from "../decorators/user.decorator";
import { AuthenticatedUserDto } from "src/application/dto/user/authenticated-user.dto";
import { IncomeUseCase } from "src/application/use-cases/income/income.use_case";
import { IncomeCreateRequestDto } from "../dtos/income/income-create.request.dto";
import { IncomeUpdateRequestDto } from "../dtos/income/income-update.request.dto";
import { IncomeResponseDto } from "../dtos/income/income.response.dto";
import { FinancialSummaryResponseDto } from "../dtos/income/financial-summary.response.dto";

@Controller('incomes')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class IncomeController {

    constructor(
        private readonly incomeUseCase: IncomeUseCase
    ) { }

    /**
     * Crear un nuevo ingreso
     * POST /incomes
     */
    @Post()
    async createIncome(
        @Body() createIncomeDto: IncomeCreateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<IncomeResponseDto> {
        return await this.incomeUseCase.createIncome(createIncomeDto, user.sub);
    }

    /**
     * Obtener ingresos por ID de casa
     * GET /incomes/house/:houseId
     */
    @Get('house/:houseId')
    async getIncomesByHouseId(@Param('houseId') houseId: number): Promise<IncomeResponseDto[]> {
        return await this.incomeUseCase.getIncomesByHouseId(houseId);
    }

    /**
     * Obtener ingresos por rango de fechas
     * GET /incomes/house/:houseId/date-range?startDate=2024-01-01&endDate=2024-12-31
     */
    @Get('house/:houseId/date-range')
    async getIncomesByDateRange(
        @Param('houseId') houseId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ): Promise<IncomeResponseDto[]> {
        if (!startDate || !endDate) {
            return await this.incomeUseCase.getIncomesByHouseId(houseId);
        }
        return await this.incomeUseCase.getIncomesByDateRange(
            houseId,
            new Date(startDate),
            new Date(endDate)
        );
    }

    /**
     * Obtener mis ingresos
     * GET /incomes/my-incomes
     */
    @Get('my-incomes')
    async getMyIncomes(@User() user: AuthenticatedUserDto): Promise<IncomeResponseDto[]> {
        return await this.incomeUseCase.getIncomesByAuth0Sub(user.sub);
    }

    /**
     * Obtener resumen financiero (ingresos vs gastos)
     * GET /incomes/financial-summary/:houseId?period=MONTHLY&startDate=...&endDate=...
     */
    @Get('financial-summary/:houseId')
    async getFinancialSummary(
        @Param('houseId') houseId: number,
        @User() user: AuthenticatedUserDto,
        @Query('period') period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<FinancialSummaryResponseDto> {
        return await this.incomeUseCase.getFinancialSummary(
            houseId,
            user.sub,
            period || 'MONTHLY',
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );
    }

    /**
     * Actualizar un ingreso
     * PUT /incomes/:id
     */
    @Put(':id')
    async updateIncome(
        @Param('id') incomeId: number,
        @Body() updateIncomeDto: IncomeUpdateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<IncomeResponseDto> {
        return await this.incomeUseCase.updateIncome(incomeId, updateIncomeDto, user.sub);
    }

    /**
     * Eliminar un ingreso
     * DELETE /incomes/:id
     */
    @Delete(':id')
    async deleteIncome(
        @Param('id') incomeId: number,
        @User() user: AuthenticatedUserDto
    ): Promise<{ message: string }> {
        await this.incomeUseCase.deleteIncome(incomeId, user.sub);
        return { message: 'Income deleted successfully' };
    }
}
