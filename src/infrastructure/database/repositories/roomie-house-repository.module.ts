import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomieHouse as DbRoomieHouse } from '../entities/roomie-house.db-entity';
import { TypeOrmRoomieHouseRepository } from './roomie-house.repository.impl';

export const ROOMIE_HOUSE_REPOSITORY = 'RoomieHouseRepository';

@Module({
    imports: [TypeOrmModule.forFeature([DbRoomieHouse])],
    providers: [
        {
            provide: ROOMIE_HOUSE_REPOSITORY,
            useClass: TypeOrmRoomieHouseRepository,
        },
    ],
    exports: [ROOMIE_HOUSE_REPOSITORY],
})
export class RoomieHouseRepositoryModule { }
