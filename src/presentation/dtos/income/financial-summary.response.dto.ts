export class FinancialSummaryResponseDto {
    public readonly totalIncome: number;
    public readonly totalExpenses: number;
    public readonly netBalance: number; // income - expenses
    public readonly savingsRate: number; // (income - expenses) / income * 100
    public readonly periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    public readonly startDate: Date;
    public readonly endDate: Date;
    public readonly topIncomeDescriptions: { description: string; amount: number }[];
    public readonly topExpenseDescriptions: { description: string; amount: number }[];
    public readonly monthlyTrend?: MonthlyTrendDto[];

    constructor(
        totalIncome: number,
        totalExpenses: number,
        periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM',
        startDate: Date,
        endDate: Date,
        topIncomeDescriptions: { description: string; amount: number }[],
        topExpenseDescriptions: { description: string; amount: number }[],
        monthlyTrend?: MonthlyTrendDto[]
    ) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.netBalance = totalIncome - totalExpenses;
        this.savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
        this.periodType = periodType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.topIncomeDescriptions = topIncomeDescriptions;
        this.topExpenseDescriptions = topExpenseDescriptions;
        this.monthlyTrend = monthlyTrend;
    }

    static create(
        totalIncome: number,
        totalExpenses: number,
        periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM',
        startDate: Date,
        endDate: Date,
        topIncomeDescriptions: { description: string; amount: number }[],
        topExpenseDescriptions: { description: string; amount: number }[],
        monthlyTrend?: MonthlyTrendDto[]
    ): FinancialSummaryResponseDto {
        return new FinancialSummaryResponseDto(
            totalIncome,
            totalExpenses,
            periodType,
            startDate,
            endDate,
            topIncomeDescriptions,
            topExpenseDescriptions,
            monthlyTrend
        );
    }

    toJSON() {
        return {
            totalIncome: this.totalIncome,
            totalExpenses: this.totalExpenses,
            netBalance: this.netBalance,
            savingsRate: this.savingsRate,
            periodType: this.periodType,
            startDate: this.startDate,
            endDate: this.endDate,
            topIncomeDescriptions: this.topIncomeDescriptions,
            topExpenseDescriptions: this.topExpenseDescriptions,
            monthlyTrend: this.monthlyTrend
        };
    }
}

export class MonthlyTrendDto {
    public readonly month: string;
    public readonly year: number;
    public readonly income: number;
    public readonly expenses: number;
    public readonly balance: number;

    constructor(month: string, year: number, income: number, expenses: number) {
        this.month = month;
        this.year = year;
        this.income = income;
        this.expenses = expenses;
        this.balance = income - expenses;
    }

    toJSON() {
        return {
            month: this.month,
            year: this.year,
            income: this.income,
            expenses: this.expenses,
            balance: this.balance
        };
    }
}
