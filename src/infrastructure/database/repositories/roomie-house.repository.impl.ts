import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomieHouse as DomainRoomieHouse } from '../../../domain/entities/roomie-house.entity';
import { RoomieHouseRepository } from '../../../domain/repositories/roomie-house.repository';
import { RoomieHouse as DbRoomieHouse } from '../entities/roomie-house.db-entity';
import { RoomieHouseMapper } from '../../mappers/roomie-house.mapper';

@Injectable()
export class TypeOrmRoomieHouseRepository implements RoomieHouseRepository {
    constructor(
        @InjectRepository(DbRoomieHouse)
        private readonly roomieHouseRepository: Repository<DbRoomieHouse>
    ) { }

    async findByRoomieAndHouse(roomieId: number, houseId: number): Promise<DomainRoomieHouse | null> {
        const dbRoomieHouse = await this.roomieHouseRepository.findOne({
            where: { roomieId, houseId }
        });
        return dbRoomieHouse ? RoomieHouseMapper.toDomain(dbRoomieHouse) : null;
    }

    async findAll(): Promise<DomainRoomieHouse[]> {
        const dbRoomieHouses = await this.roomieHouseRepository.find();
        return RoomieHouseMapper.toDomainArray(dbRoomieHouses);
    }

    async save(roomieHouse: DomainRoomieHouse): Promise<DomainRoomieHouse> {
        const dbRoomieHouse = RoomieHouseMapper.toDatabase(roomieHouse);
        const savedDbRoomieHouse = await this.roomieHouseRepository.save(dbRoomieHouse);
        return RoomieHouseMapper.toDomain(savedDbRoomieHouse);
    }

    async delete(roomieId: number, houseId: number): Promise<void> {
        await this.roomieHouseRepository.delete({ roomieId, houseId });
    }

    async findByRoomieId(roomieId: number): Promise<DomainRoomieHouse[]> {
        const dbRoomieHouses = await this.roomieHouseRepository.find({
            where: { roomieId }
        });
        return RoomieHouseMapper.toDomainArray(dbRoomieHouses);
    }

    async findByHouseId(houseId: number): Promise<DomainRoomieHouse[]> {
        const dbRoomieHouses = await this.roomieHouseRepository.find({
            where: { houseId }
        });
        return RoomieHouseMapper.toDomainArray(dbRoomieHouses);
    }
}
