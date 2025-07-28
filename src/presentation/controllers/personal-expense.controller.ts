import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileCompletedGuard } from '../guards/profile-completed.guard';
import { PersonalExpenseUseCase } from 'src/application/use-cases/expense/personal-expense.use_case';
import { PersonalExpenseCreateRequestDto } from 'src/presentation/dtos/expense/personal-expense-create.request.dto';
import { PersonalExpenseUpdateRequestDto } from 'src/presentation/dtos/expense/personal-expense-update.request.dto';
import { PersonalExpenseResponseDto } from 'src/presentation/dtos/expense/personal-expense.response.dto';
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
        // Asegurar que el gasto se cree para el usuario autenticado
        createExpenseDto.paidById = parseInt(user.sub);
        return await this.personalExpenseUseCase.createPersonalExpense(createExpenseDto);
    }

    @Get()
    async getPersonalExpenses(
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto[]> {
        return await this.personalExpenseUseCase.getPersonalExpensesByUserId(parseInt(user.sub));
    }

    @Get('summary')
    async getPersonalExpenseSummary(
        @User() user: AuthenticatedUserDto
    ): Promise<{ totalExpenses: number; expenseCount: number; averageExpense: number }> {
        return await this.personalExpenseUseCase.getPersonalExpenseSummary(parseInt(user.sub));
    }

    @Get('date-range')
    async getPersonalExpensesByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return await this.personalExpenseUseCase.getPersonalExpensesByDateRange(parseInt(user.sub), start, end);
    }

    @Get(':id')
    async getPersonalExpenseById(
        @Param('id', ParseIntPipe) expenseId: number,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto> {
        return await this.personalExpenseUseCase.getPersonalExpenseById(expenseId, parseInt(user.sub));
    }

    @Put(':id')
    async updatePersonalExpense(
        @Param('id', ParseIntPipe) expenseId: number,
        @Body() updateExpenseDto: PersonalExpenseUpdateRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<PersonalExpenseResponseDto> {
        return await this.personalExpenseUseCase.updatePersonalExpense(expenseId, parseInt(user.sub), updateExpenseDto);
    }

    @Delete(':id')
    async deletePersonalExpense(
        @Param('id', ParseIntPipe) expenseId: number,
        @User() user: AuthenticatedUserDto
    ): Promise<void> {
        await this.personalExpenseUseCase.deletePersonalExpense(expenseId, parseInt(user.sub));
    }
}
