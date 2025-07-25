import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseShare as DomainExpenseShare } from '../../../domain/entities/expense-share.entity';
import { ExpenseShareRepository } from '../../../domain/repositories/expense-share.repository';
import { ExpenseShare as DbExpenseShare } from '../entities/expense-share.db-entity';
import { ExpenseShareMapper } from '../../mappers/expense-share.mapper';

@Injectable()
export class TypeOrmExpenseShareRepository implements ExpenseShareRepository {
    constructor(
        @InjectRepository(DbExpenseShare)
        private readonly expenseShareRepository: Repository<DbExpenseShare>
    ) { }

    async findById(id: number): Promise<DomainExpenseShare | null> {
        const dbExpenseShare = await this.expenseShareRepository.findOne({ where: { id } });
        return dbExpenseShare ? ExpenseShareMapper.toDomain(dbExpenseShare) : null;
    }

    async findAll(): Promise<DomainExpenseShare[]> {
        const dbExpenseShares = await this.expenseShareRepository.find();
        return ExpenseShareMapper.toDomainArray(dbExpenseShares);
    }

    async save(expenseShare: DomainExpenseShare): Promise<DomainExpenseShare> {
        const dbExpenseShare = ExpenseShareMapper.toDatabase(expenseShare);
        const savedDbExpenseShare = await this.expenseShareRepository.save(dbExpenseShare);
        return ExpenseShareMapper.toDomain(savedDbExpenseShare);
    }

    async delete(id: number): Promise<void> {
        await this.expenseShareRepository.delete(id);
    }

    async findByExpenseId(expenseId: number): Promise<DomainExpenseShare[]> {
        const dbExpenseShares = await this.expenseShareRepository.find({
            where: { expenseId }
        });
        return ExpenseShareMapper.toDomainArray(dbExpenseShares);
    }

    async findByRoomieId(roomieId: number): Promise<DomainExpenseShare[]> {
        const dbExpenseShares = await this.expenseShareRepository.find({
            where: { roomieId }
        });
        return ExpenseShareMapper.toDomainArray(dbExpenseShares);
    }

    async findByExpenseAndRoomie(expenseId: number, roomieId: number): Promise<DomainExpenseShare | null> {
        const dbExpenseShare = await this.expenseShareRepository.findOne({
            where: { expenseId, roomieId }
        });
        return dbExpenseShare ? ExpenseShareMapper.toDomain(dbExpenseShare) : null;
    }
}
