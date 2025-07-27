import { Module } from '@nestjs/common';
import { UserUseCaseModule } from './user/user-usecase.module';
import { HouseUseCaseModule } from './house/house-usecase.module';

@Module({
    imports: [UserUseCaseModule, HouseUseCaseModule],
    exports: [UserUseCaseModule, HouseUseCaseModule],
})
export class UseCasesModule { }
