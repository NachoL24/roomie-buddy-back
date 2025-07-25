import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roomie as DbRoomie } from '../entities/roomie.db-entity';
import { TypeOrmRoomieRepository } from './roomie.repository.impl';

export const ROOMIE_REPOSITORY = 'RoomieRepository';

@Module({
    imports: [TypeOrmModule.forFeature([DbRoomie])],
    providers: [
        {
            provide: ROOMIE_REPOSITORY,
            useClass: TypeOrmRoomieRepository,
        },
    ],
    exports: [ROOMIE_REPOSITORY],
})
export class RoomieRepositoryModule { }
