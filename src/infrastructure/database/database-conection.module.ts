import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

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
                    entities: [__dirname + '/entities/*.db-entity.ts'],
                    synchronize: false,
                    logging: true,
                }
                console.log('Database connection config:', config);

                return config as TypeOrmModuleOptions;
            }
        });
    }
}