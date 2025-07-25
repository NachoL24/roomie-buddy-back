import { TypeOrmModule } from "@nestjs/typeorm";

export class DatabaseConnectionModule {
    static forRoot() {
        return TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            entities: [__dirname + '/entities/*.db-entity.ts'],
            synchronize: false,
            logging: true,
        })
    }
}