import { Roomie } from '../entities/roomie.entity';

export interface RoomieRepository {
    findById(id: number): Promise<Roomie | null>;
    findByAuth0Sub(auth0Sub: string): Promise<Roomie | null>;
    findAll(): Promise<Roomie[]>;
    save(roomie: Roomie): Promise<Roomie>;
    delete(id: number): Promise<void>;
    findByEmail(email: string): Promise<Roomie | null>;
    findByHouseId(houseId: number): Promise<Roomie[]>;
}
