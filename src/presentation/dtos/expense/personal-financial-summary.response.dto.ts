export class PersonalFinancialSummaryResponseDto {
    public readonly currentMonthExpenses: number;
    public readonly currentMonthIncome: number;
    public readonly currentMonthBalance: number; // income - expenses del mes actual
    public readonly totalBalance: number; // balance acumulado total (todos los ingresos - todos los gastos)
    public readonly periodStartDate: Date;
    public readonly periodEndDate: Date;
    public readonly expenseCount: number;
    public readonly incomeCount: number;

    constructor(
        currentMonthExpenses: number,
        currentMonthIncome: number,
        totalBalance: number,
        periodStartDate: Date,
        periodEndDate: Date,
        expenseCount: number,
        incomeCount: number
    ) {
        this.currentMonthExpenses = Math.round(currentMonthExpenses * 100) / 100;
        this.currentMonthIncome = Math.round(currentMonthIncome * 100) / 100;
        this.currentMonthBalance = Math.round((currentMonthIncome - currentMonthExpenses) * 100) / 100;
        this.totalBalance = Math.round(totalBalance * 100) / 100;
        this.periodStartDate = periodStartDate;
        this.periodEndDate = periodEndDate;
        this.expenseCount = expenseCount;
        this.incomeCount = incomeCount;
    }

    static create(
        currentMonthExpenses: number,
        currentMonthIncome: number,
        totalBalance: number,
        periodStartDate: Date,
        periodEndDate: Date,
        expenseCount: number,
        incomeCount: number
    ): PersonalFinancialSummaryResponseDto {
        return new PersonalFinancialSummaryResponseDto(
            currentMonthExpenses,
            currentMonthIncome,
            totalBalance,
            periodStartDate,
            periodEndDate,
            expenseCount,
            incomeCount
        );
    }

    toJSON() {
        return {
            currentMonthExpenses: this.currentMonthExpenses,
            currentMonthIncome: this.currentMonthIncome,
            currentMonthBalance: this.currentMonthBalance,
            totalBalance: this.totalBalance,
            periodStartDate: this.periodStartDate,
            periodEndDate: this.periodEndDate,
            expenseCount: this.expenseCount,
            incomeCount: this.incomeCount
        };
    }
}
