import { Injectable } from '@nestjs/common';
import { Settlement } from 'src/domain/entities/settlement.entity';
import { SettlementRepository } from 'src/domain/repositories/settlement.repository';

@Injectable()
export class SettlementRepositoryImpl implements SettlementRepository {
    private settlements: Settlement[] = []; // Mock implementation
    private nextId = 1;

    async findById(id: number): Promise<Settlement | null> {
        return this.settlements.find(settlement => settlement.id === id) || null;
    }

    async findAll(): Promise<Settlement[]> {
        return [...this.settlements];
    }

    async save(settlement: Settlement): Promise<Settlement> {
        if (settlement.id === 0) {
            // Create new
            const newSettlement = Settlement.create(
                settlement.fromRoomieId,
                settlement.toRoomieId,
                settlement.amount,
                settlement.houseId,
                this.nextId++,
                settlement.description,
                settlement.createdAt
            );
            this.settlements.push(newSettlement);
            return newSettlement;
        } else {
            // Update existing
            const index = this.settlements.findIndex(s => s.id === settlement.id);
            if (index !== -1) {
                this.settlements[index] = settlement;
                return settlement;
            }
            throw new Error(`Settlement with id ${settlement.id} not found`);
        }
    }

    async delete(id: number): Promise<void> {
        const index = this.settlements.findIndex(settlement => settlement.id === id);
        if (index !== -1) {
            this.settlements.splice(index, 1);
        }
    }

    async findByHouseId(houseId: number): Promise<Settlement[]> {
        return this.settlements.filter(settlement => settlement.houseId === houseId);
    }

    async findByFromRoomieId(fromRoomieId: number): Promise<Settlement[]> {
        return this.settlements.filter(settlement => settlement.fromRoomieId === fromRoomieId);
    }

    async findByToRoomieId(toRoomieId: number): Promise<Settlement[]> {
        return this.settlements.filter(settlement => settlement.toRoomieId === toRoomieId);
    }

    async findByRoomieId(roomieId: number): Promise<Settlement[]> {
        return this.settlements.filter(settlement =>
            settlement.fromRoomieId === roomieId || settlement.toRoomieId === roomieId
        );
    }
}
