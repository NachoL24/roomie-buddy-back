import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Roomie } from "./entities/roomie.db-entity";
import { House } from "./entities/house.db-entity";
import { RoomieHouse } from "./entities/roomie-house.db-entity";
import { Expense } from "./entities/expense.db-entity";
import { ExpenseShare } from "./entities/expense-share.db-entity";

export class DatabaseConnectionModule {
    static forRoot() {
        return TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const config = {
                    type: 'mysql',
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT') || 3306,
                    username: configService.get<string>('DB_USER'),
                    password: configService.get<string>('DB_PASS'),
                    database: configService.get<string>('DB_NAME'),
                    entities: [
                        Roomie,
                        House,
                        RoomieHouse,
                        Expense,
                        ExpenseShare
                    ],
                    synchronize: true,
                    logging: true,
                }
                console.log('Database connection config:', config);

                return config as TypeOrmModuleOptions;
            }
        });
    }
}