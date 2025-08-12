import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettlementRepository } from 'src/domain/repositories/settlement.repository';
import { Settlement } from 'src/domain/entities/settlement.entity';
import { Settlement as SettlementDbEntity } from '../entities/settlement.db-entity';

@Injectable()
export class SettlementTypeOrmRepository implements SettlementRepository {
    constructor(
        @InjectRepository(SettlementDbEntity)
        private readonly repository: Repository<SettlementDbEntity>
    ) { }

    async findById(id: number): Promise<Settlement | null> {
        const found = await this.repository.findOne({ where: { id } });
        return found ? this.toDomainEntity(found) : null;
    }

    async findAll(): Promise<Settlement[]> {
        const found = await this.repository.find({
            order: { createdAt: 'DESC' }
        });
        return found.map(entity => this.toDomainEntity(entity));
    }

    async save(settlement: Settlement): Promise<Settlement> {
        const dbEntity = this.toDbEntity(settlement);
        const saved = await this.repository.save(dbEntity);
        return this.toDomainEntity(saved);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findByHouseId(houseId: number): Promise<Settlement[]> {
        const found = await this.repository.find({
            where: { houseId },
            order: { createdAt: 'DESC' }
        });
        return found.map(entity => this.toDomainEntity(entity));
    }

    async findByFromRoomieId(fromRoomieId: number): Promise<Settlement[]> {
        const found = await this.repository.find({
            where: { fromRoomieId },
            order: { createdAt: 'DESC' }
        });
        return found.map(entity => this.toDomainEntity(entity));
    }

    async findByToRoomieId(toRoomieId: number): Promise<Settlement[]> {
        const found = await this.repository.find({
            where: { toRoomieId },
            order: { createdAt: 'DESC' }
        });
        return found.map(entity => this.toDomainEntity(entity));
    }

    async findByRoomieId(roomieId: number): Promise<Settlement[]> {
        const found = await this.repository.createQueryBuilder('settlement')
            .where('settlement.fromRoomieId = :roomieId', { roomieId })
            .orWhere('settlement.toRoomieId = :roomieId', { roomieId })
            .orderBy('settlement.createdAt', 'DESC')
            .getMany();

        return found.map(entity => this.toDomainEntity(entity));
    }

    private toDomainEntity(dbEntity: SettlementDbEntity): Settlement {
        return Settlement.create(
            dbEntity.fromRoomieId,
            dbEntity.toRoomieId,
            Number(dbEntity.amount),
            dbEntity.date,
            dbEntity.houseId,
            dbEntity.id,
            dbEntity.description,
            dbEntity.createdAt
        );
    }

    private toDbEntity(domainEntity: Settlement): SettlementDbEntity {
        const dbEntity = new SettlementDbEntity();
        dbEntity.id = domainEntity.id;
        dbEntity.fromRoomieId = domainEntity.fromRoomieId;
        dbEntity.toRoomieId = domainEntity.toRoomieId;
        dbEntity.amount = domainEntity.amount;
        dbEntity.date = domainEntity.date;
        dbEntity.description = domainEntity.description;
        dbEntity.houseId = domainEntity.houseId;
        dbEntity.createdAt = domainEntity.createdAt;
        return dbEntity;
    }
}
