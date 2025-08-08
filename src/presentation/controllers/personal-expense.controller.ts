import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileCompletedGuard } from '../guards/profile-completed.guard';
import { PersonalExpenseUseCase } from 'src/application/use-cases/expense/personal-expense.use_case';
import { PersonalExpenseCreateRequestDto } from 'src/presentation/dtos/expense/personal-expense-create.request.dto';
import { PersonalExpenseUpdateRequestDto } from 'src/presentation/dtos/expense/personal-expense-update.request.dto';
import { PersonalExpenseResponseDto } from 'src/presentation/dtos/expense/personal-expense.response.dto';
import { PersonalFinancialSummaryResponseDto } from 'src/presentation/dtos/expense/personal-financial-summary.response.dto';
import { User } from 'src/presentation/decorators/user.decorator';
import { AuthenticatedUserDto } from 'src/application/dto/user/authenticated-user.dto';

@Controller('expenses/personal')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class PersonalExpenseController {
    constructor(
        private readonly personalExpenseUseCase: PersonalExpenseUseCase
    ) { }

    @Post()
    async createPersonalExpense(
        @Body() createExpenseDto: PersonalExpenseCreateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto> {
        return await this.personalExpenseUseCase.createPersonalExpenseByAuth0Sub(createExpenseDto, user.sub);
    }

    @Get()
    async getPersonalExpenses(
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto[]> {
        return await this.personalExpenseUseCase.getPersonalExpensesByAuth0Sub(user.sub);
    }

    @Get('summary')
    async getPersonalFinancialSummary(
        @User() user: AuthenticatedUserDto,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<PersonalFinancialSummaryResponseDto> {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.personalExpenseUseCase.getPersonalFinancialSummaryByAuth0Sub(user.sub, start, end);
    }

    @Get('summary/simple')
    async getPersonalExpenseSummary(
        @User() user: AuthenticatedUserDto
    ): Promise<{ totalExpenses: number; expenseCount: number; averageExpense: number }> {
        return await this.personalExpenseUseCase.getPersonalExpenseSummaryByAuth0Sub(user.sub);
    }

    @Get('date-range')
    async getPersonalExpensesByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return await this.personalExpenseUseCase.getPersonalExpensesByDateRangeAndAuth0Sub(user.sub, start, end);
    }

    @Get(':id')
    async getPersonalExpenseById(
        @Param('id', ParseIntPipe) expenseId: number,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto> {
        return await this.personalExpenseUseCase.getPersonalExpenseByIdAndAuth0Sub(expenseId, user.sub);
    }

    @Put(':id')
    async updatePersonalExpense(
        @Param('id', ParseIntPipe) expenseId: number,
        @Body() updateExpenseDto: PersonalExpenseUpdateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto> {
        return await this.personalExpenseUseCase.updatePersonalExpenseByAuth0Sub(expenseId, user.sub, updateExpenseDto);
    }

    @Delete(':id')
    async deletePersonalExpense(
        @Param('id', ParseIntPipe) expenseId: number,
        @User() user: AuthenticatedUserDto
    ): Promise<void> {
        await this.personalExpenseUseCase.deletePersonalExpenseByAuth0Sub(expenseId, user.sub);
    }
}
