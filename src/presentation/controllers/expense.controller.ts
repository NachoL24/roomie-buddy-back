import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfileCompletedGuard } from "../guards/profile-completed.guard";
import { User } from "../decorators/user.decorator";
import { AuthenticatedUserDto } from "src/application/dto/user/authenticated-user.dto";
import { ExpenseUseCase } from "src/application/use-cases/expense/expense.use_case";
import { ExpenseCreateRequestDto } from "../dtos/expense/expense-create.request.dto";
import { ExpenseUpdateRequestDto } from "../dtos/expense/expense-update.request.dto";
import { ExpenseWithSharesResponseDto } from "../dtos/expense/expense-with-shares.response.dto";
import { ExpenseSummaryResponseDto } from "../dtos/expense/expense-summary.response.dto";

@Controller('expenses/house')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class ExpenseController {

    constructor(private readonly expenseUseCase: ExpenseUseCase) { }

    @Post()
    async createHouseExpense(
        @Body() createExpenseDto: ExpenseCreateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<ExpenseWithSharesResponseDto> {
        return await this.expenseUseCase.createExpense(createExpenseDto);
    }

    @Get(':id')
    async getHouseExpenseById(@Param('id') id: number): Promise<ExpenseWithSharesResponseDto> {
        return await this.expenseUseCase.getExpenseById(id);
    }

    @Get('by-house/:houseId')
    async getExpensesByHouseId(
        @Param('houseId') houseId: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<ExpenseWithSharesResponseDto[]> {
        if (startDate && endDate) {
            return await this.expenseUseCase.getExpensesByDateRange(
                houseId,
                new Date(startDate),
                new Date(endDate)
            );
        }
        return await this.expenseUseCase.getExpensesByHouseId(houseId);
    }

    @Get('by-roomie/:roomieId')
    async getExpensesByRoomieId(@Param('roomieId') roomieId: number): Promise<ExpenseWithSharesResponseDto[]> {
        return await this.expenseUseCase.getExpensesByRoomieId(roomieId);
    }

    @Get('summary/:houseId')
    async getExpenseSummaryByHouse(@Param('houseId') houseId: number): Promise<ExpenseSummaryResponseDto[]> {
        return await this.expenseUseCase.getExpenseSummaryByHouse(houseId);
    }

    @Put(':id')
    async updateHouseExpense(
        @Param('id') id: number,
        @Body() updateExpenseDto: ExpenseUpdateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<ExpenseWithSharesResponseDto> {
        return await this.expenseUseCase.updateExpense(id, updateExpenseDto);
    }

    @Delete(':id')
    async deleteHouseExpense(
        @Param('id') id: number,
        @User() user: AuthenticatedUserDto
    ): Promise<void> {
        return await this.expenseUseCase.deleteExpense(id);
    }
}
