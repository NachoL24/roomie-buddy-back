import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roomie as DomainRoomie } from '../../../domain/entities/roomie.entity';
import { RoomieRepository } from '../../../domain/repositories/roomie.repository';
import { Roomie as DbRoomie } from '../entities/roomie.db-entity';
import { Invitation as DbInvitation } from '../entities/invitation.db-entity';
import { RoomieMapper } from '../../mappers/roomie.mapper';

@Injectable()
export class TypeOrmRoomieRepository implements RoomieRepository {
    constructor(
        @InjectRepository(DbRoomie)
        private readonly roomieRepository: Repository<DbRoomie>
    ) { }

    findByAuth0Sub(auth0Sub: string): Promise<DomainRoomie | null> {
        return this.roomieRepository.findOne({ where: { auth0Sub } })
            .then(dbRoomie => dbRoomie ? RoomieMapper.toDomain(dbRoomie) : null);
    }

    async findById(id: number): Promise<DomainRoomie | null> {
        console.log("Finding roomie by ID:", id);
        const dbRoomie = await this.roomieRepository.findOne({ where: { id } });
        console.log("Finding roomie by ID:", id, "Result:", dbRoomie);
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

    async find5ByEmail(email: string, houseId: number): Promise<DomainRoomie[]> {
        const dbRoomies = await this.roomieRepository
            .createQueryBuilder('roomie')
            .where('roomie.email LIKE :email', { email: `%${email}%` })
            .andWhere((qb) => {
                const sub = qb.subQuery()
                    .select('1')
                    .from(DbInvitation, 'inv')
                    .where('inv.inviteeId = roomie.id')
                    .andWhere('inv.houseId = :houseId')
                    .andWhere('inv.status = :pending')
                    .getQuery();
                return `NOT EXISTS ${sub}`;
            })
            .setParameters({ houseId, pending: 'PENDING' })
            .limit(5)
            .getMany();
        return RoomieMapper.toDomainArray(dbRoomies);
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
