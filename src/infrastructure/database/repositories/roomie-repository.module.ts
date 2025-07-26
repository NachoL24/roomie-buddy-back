import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roomie as DbRoomie } from '../entities/roomie.db-entity';
import { TypeOrmRoomieRepository } from './roomie.repository.impl';

export const ROOMIE_REPOSITORY = Symbol('ROOMIE_REPOSITORY');

@Module({
    imports: [TypeOrmModule.forFeature([DbRoomie])],
    providers: [
        TypeOrmRoomieRepository,
        {
            provide: ROOMIE_REPOSITORY, // Hexagonal port
            useExisting: TypeOrmRoomieRepository, // Use the same instance
        },
    ],
    exports: [ROOMIE_REPOSITORY],
})
export class RoomieRepositoryModule { }
