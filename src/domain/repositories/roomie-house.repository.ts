import { RoomieHouse } from '../entities/roomie-house.entity';

export interface RoomieHouseRepository {
    findByRoomieAndHouse(roomieId: number, houseId: number): Promise<RoomieHouse | null>;
    findAll(): Promise<RoomieHouse[]>;
    save(roomieHouse: RoomieHouse): Promise<RoomieHouse>;
    delete(roomieId: number, houseId: number): Promise<void>;
    findByRoomieId(roomieId: number): Promise<RoomieHouse[]>;
    findByHouseId(houseId: number): Promise<RoomieHouse[]>;
}
