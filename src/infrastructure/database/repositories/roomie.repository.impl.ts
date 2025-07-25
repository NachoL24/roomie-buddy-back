import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roomie as DomainRoomie } from '../../../domain/entities/roomie.entity';
import { RoomieRepository } from '../../../domain/repositories/roomie.repository';
import { Roomie as DbRoomie } from '../entities/roomie.db-entity';
import { RoomieMapper } from '../../mappers/roomie.mapper';

@Injectable()
export class TypeOrmRoomieRepository implements RoomieRepository {
    constructor(
        @InjectRepository(DbRoomie)
        private readonly roomieRepository: Repository<DbRoomie>
    ) { }

    async findById(id: number): Promise<DomainRoomie | null> {
        const dbRoomie = await this.roomieRepository.findOne({ where: { id } });
        return dbRoomie ? RoomieMapper.toDomain(dbRoomie) : null;
    }

    async findAll(): Promise<DomainRoomie[]> {
        const dbRoomies = await this.roomieRepository.find();
        return RoomieMapper.toDomainArray(dbRoomies);
    }

    async save(roomie: DomainRoomie): Promise<DomainRoomie> {
        const dbRoomie = RoomieMapper.toDatabase(roomie);
        const savedDbRoomie = await this.roomieRepository.save(dbRoomie);
        return RoomieMapper.toDomain(savedDbRoomie);
    }

    async delete(id: number): Promise<void> {
        await this.roomieRepository.softDelete(id);
    }

    async findByEmail(email: string): Promise<DomainRoomie | null> {
        const dbRoomie = await this.roomieRepository.findOne({ where: { email } });
        return dbRoomie ? RoomieMapper.toDomain(dbRoomie) : null;
    }

    async findByHouseId(houseId: number): Promise<DomainRoomie[]> {
        const dbRoomies = await this.roomieRepository
            .createQueryBuilder('roomie')
            .innerJoin('roomie.memberships', 'membership')
            .where('membership.houseId = :houseId', { houseId })
            .getMany();
        return RoomieMapper.toDomainArray(dbRoomies);
    }
}
