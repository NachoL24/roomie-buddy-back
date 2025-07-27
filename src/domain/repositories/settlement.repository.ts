import { Settlement } from '../entities/settlement.entity';

export interface SettlementRepository {
    findById(id: number): Promise<Settlement | null>;
    findAll(): Promise<Settlement[]>;
    save(settlement: Settlement): Promise<Settlement>;
    delete(id: number): Promise<void>;
    findByHouseId(houseId: number): Promise<Settlement[]>;
    findByFromRoomieId(fromRoomieId: number): Promise<Settlement[]>;
    findByToRoomieId(toRoomieId: number): Promise<Settlement[]>;
    findByRoomieId(roomieId: number): Promise<Settlement[]>; // Pagos hechos o recibidos
}
