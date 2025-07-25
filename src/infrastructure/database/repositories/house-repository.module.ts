import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House as DbHouse } from '../entities/house.db-entity';
import { TypeOrmHouseRepository } from './house.repository.impl';

export const HOUSE_REPOSITORY = 'HouseRepository';

@Module({
    imports: [TypeOrmModule.forFeature([DbHouse])],
    providers: [
        {
            provide: HOUSE_REPOSITORY,
            useClass: TypeOrmHouseRepository,
        },
    ],
    exports: [HOUSE_REPOSITORY],
})
export class HouseRepositoryModule { }
