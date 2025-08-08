import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './presentation/guards/auth.module';
import { Auth0UserinfoModule } from './infrastructure/external-services/auth0/auth0-userInfo.module';
import { Auth0ManagementApiModule } from './infrastructure/external-services/auth0/auth0-managementapi.module';
import { DatabaseConnectionModule } from './infrastructure/database/database-conection.module';
import { RepositoriesModule } from './infrastructure/database/repositories';
import { UserController } from './presentation/controllers/user.controller';
import { UseCasesModule } from './application/use-cases/use-cases.module';
import { HouseController } from './presentation/controllers/house.controller';
import { InvitationController } from './presentation/controllers/invitation.controller';
import { ExpenseController } from './presentation/controllers/expense.controller';
import { PersonalExpenseController } from './presentation/controllers/personal-expense.controller';
import { SettlementController } from './presentation/controllers/settlement.controller';
import { IncomeController } from './presentation/controllers/income.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    Auth0UserinfoModule,
    Auth0ManagementApiModule,
    DatabaseConnectionModule.forRoot(),
    RepositoriesModule,
    UseCasesModule,
  ],
  controllers: [AppController, UserController, HouseController, InvitationController, ExpenseController, PersonalExpenseController, SettlementController, IncomeController],
  providers: [AppService],
})
export class AppModule { }