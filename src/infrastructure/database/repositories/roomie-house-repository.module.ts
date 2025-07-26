import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomieHouse as DbRoomieHouse } from '../entities/roomie-house.db-entity';
import { TypeOrmRoomieHouseRepository } from './roomie-house.repository.impl';

export const ROOMIE_HOUSE_REPOSITORY = Symbol('RoomieHouseRepository');

@Module({
    imports: [TypeOrmModule.forFeature([DbRoomieHouse])],
    providers: [
        TypeOrmRoomieHouseRepository,
        {
            provide: ROOMIE_HOUSE_REPOSITORY,
            useExisting: TypeOrmRoomieHouseRepository,
        },
    ],
    exports: [ROOMIE_HOUSE_REPOSITORY],
})
export class RoomieHouseRepositoryModule { }
