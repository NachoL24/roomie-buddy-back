import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Income as DomainIncome } from '../../../domain/entities/income.entity';
import { IncomeRepository } from '../../../domain/repositories/income.repository';
import { Income as DbIncome } from '../entities/income.db-entity';
import { IncomeMapper } from '../../mappers/income.mapper';

@Injectable()
export class TypeOrmIncomeRepository implements IncomeRepository {
    constructor(
        @InjectRepository(DbIncome)
        private readonly incomeRepository: Repository<DbIncome>
    ) { }

    async findById(id: number): Promise<DomainIncome | null> {
        const dbIncome = await this.incomeRepository.findOne({
            where: { id },
            relations: ['earnedBy', 'house']
        });
        return dbIncome ? IncomeMapper.toDomain(dbIncome) : null;
    }

    async findAll(): Promise<DomainIncome[]> {
        const dbIncomes = await this.incomeRepository.find({
            relations: ['earnedBy', 'house']
        });
        return IncomeMapper.toDomainArray(dbIncomes);
    }

    async findByHouseId(houseId: number): Promise<DomainIncome[]> {
        const dbIncomes = await this.incomeRepository.find({
            where: { house: { id: houseId } },
            relations: ['earnedBy', 'house']
        });
        return IncomeMapper.toDomainArray(dbIncomes);
    }

    async findByEarnedById(earnedById: number): Promise<DomainIncome[]> {
        const dbIncomes = await this.incomeRepository.find({
            where: { earnedBy: { id: earnedById } },
            relations: ['earnedBy', 'house']
        });
        return IncomeMapper.toDomainArray(dbIncomes);
    }

    async findByHouseIdAndDateRange(houseId: number, startDate: Date, endDate: Date): Promise<DomainIncome[]> {
        const dbIncomes = await this.incomeRepository.find({
            where: {
                house: { id: houseId },
                earnedAt: Between(startDate, endDate)
            },
            relations: ['earnedBy', 'house']
        });
        return IncomeMapper.toDomainArray(dbIncomes);
    }

    async findRecurringIncomes(): Promise<DomainIncome[]> {
        const dbIncomes = await this.incomeRepository.find({
            where: { isRecurring: true },
            relations: ['earnedBy', 'house']
        });
        return IncomeMapper.toDomainArray(dbIncomes);
    }

    async save(income: DomainIncome): Promise<DomainIncome> {
        const dbIncome = IncomeMapper.toDatabase(income);

        // Set relations manually
        if (income.earnedById) {
            dbIncome.earnedBy = { id: income.earnedById } as any;
        }
        if (income.houseId) {
            dbIncome.house = { id: income.houseId } as any;
        }

        const savedDbIncome = await this.incomeRepository.save(dbIncome);

        // Fetch the complete entity with relations
        const completeIncome = await this.incomeRepository.findOne({
            where: { id: savedDbIncome.id },
            relations: ['earnedBy', 'house']
        });

        return IncomeMapper.toDomain(completeIncome!);
    }

    async update(income: DomainIncome): Promise<DomainIncome> {
        const existingDbIncome = await this.incomeRepository.findOne({
            where: { id: income.id }
        });

        if (!existingDbIncome) {
            throw new Error(`Income with ID ${income.id} not found`);
        }

        const dbIncome = IncomeMapper.toDatabase(income);

        // Set relations manually
        if (income.earnedById) {
            dbIncome.earnedBy = { id: income.earnedById } as any;
        }
        if (income.houseId) {
            dbIncome.house = { id: income.houseId } as any;
        }

        const savedDbIncome = await this.incomeRepository.save(dbIncome);

        // Fetch the complete entity with relations
        const completeIncome = await this.incomeRepository.findOne({
            where: { id: savedDbIncome.id },
            relations: ['earnedBy', 'house']
        });

        return IncomeMapper.toDomain(completeIncome!);
    }

    async delete(id: number): Promise<void> {
        await this.incomeRepository.delete(id);
    }
}
