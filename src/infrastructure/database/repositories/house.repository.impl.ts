import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { House as DomainHouse } from '../../../domain/entities/house.entity';
import { HouseRepository } from '../../../domain/repositories/house.repository';
import { House as DbHouse } from '../entities/house.db-entity';
import { HouseMapper } from '../../mappers/house.mapper';

@Injectable()
export class TypeOrmHouseRepository implements HouseRepository {
    constructor(
        @InjectRepository(DbHouse)
        private readonly dbRepository: Repository<DbHouse>
    ) { }

    async findById(id: number): Promise<DomainHouse | null> {
        const dbHouse = await this.dbRepository.findOne({ where: { id } });
        return dbHouse ? HouseMapper.toDomain(dbHouse) : null;
    }

    async findAll(): Promise<DomainHouse[]> {
        const dbHouses = await this.dbRepository.find();
        return HouseMapper.toDomainArray(dbHouses);
    }

    async save(house: DomainHouse): Promise<DomainHouse> {
        const dbHouse = HouseMapper.toDatabase(house);
        const savedDbHouse = await this.dbRepository.save(dbHouse);
        return HouseMapper.toDomain(savedDbHouse);
    }

    async delete(id: number): Promise<void> {
        await this.dbRepository.softDelete(id);
    }

    async findByName(name: string): Promise<DomainHouse | null> {
        const dbHouse = await this.dbRepository.findOne({ where: { name } });
        return dbHouse ? HouseMapper.toDomain(dbHouse) : null;
    }

    async findByRoomieId(roomieId: number): Promise<DomainHouse[]> {
        const dbHouses = await this.dbRepository
            .createQueryBuilder('house')
            .innerJoin('house.memberships', 'membership')
            .where('membership.roomie.id = :roomieId', { roomieId })
            .getMany();

        return HouseMapper.toDomainArray(dbHouses);
    }
}
