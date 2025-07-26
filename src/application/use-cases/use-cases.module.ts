import { Module } from '@nestjs/common';
import { UserUseCaseModule } from './user/user-usecase.module';

@Module({
    imports: [UserUseCaseModule],
    exports: [UserUseCaseModule],
})
export class UseCasesModule { }
