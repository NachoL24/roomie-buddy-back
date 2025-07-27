import { House } from '../entities/house.entity';

export interface HouseRepository {
    findById(id: number): Promise<House | null>;
    findAll(): Promise<House[]>;
    save(house: House): Promise<House>;
    delete(id: number): Promise<void>;
    findByName(name: string): Promise<House | null>;
    findByRoomieId(roomieId: number): Promise<House[]>;
}
