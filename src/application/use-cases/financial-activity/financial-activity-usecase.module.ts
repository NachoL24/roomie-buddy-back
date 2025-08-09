import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/infrastructure/database/repositories';
import { FinancialActivityUseCase } from './financial-activity.use_case';

@Module({
    imports: [RepositoriesModule],
    providers: [FinancialActivityUseCase],
    exports: [FinancialActivityUseCase],
})
export class FinancialActivityUseCaseModule { }
