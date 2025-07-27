import { Module } from '@nestjs/common';
import { HouseUseCase } from './house.use_case';
import { RepositoriesModule } from 'src/infrastructure/database/repositories';

@Module({
    imports: [
        RepositoriesModule,
    ],
    providers: [HouseUseCase],
    exports: [HouseUseCase],
})
export class HouseUseCaseModule { }
