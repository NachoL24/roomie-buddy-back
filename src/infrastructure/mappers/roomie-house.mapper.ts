import { RoomieHouse as DomainRoomieHouse } from '../../domain/entities/roomie-house.entity';
import { RoomieHouse as DbRoomieHouse } from '../database/entities/roomie-house.db-entity';

export class RoomieHouseMapper {
    public static toDomain(dbRoomieHouse: DbRoomieHouse): DomainRoomieHouse {
        return new DomainRoomieHouse(
            dbRoomieHouse.roomieId,
            dbRoomieHouse.houseId,
            dbRoomieHouse.payRatio ? Number(dbRoomieHouse.payRatio) : undefined
        );
    }

    public static toDatabase(domainRoomieHouse: DomainRoomieHouse): DbRoomieHouse {
        const dbRoomieHouse = new DbRoomieHouse();
        dbRoomieHouse.roomieId = domainRoomieHouse.roomieId;
        dbRoomieHouse.houseId = domainRoomieHouse.houseId;
        dbRoomieHouse.payRatio = domainRoomieHouse.payRatio;
        return dbRoomieHouse;
    }

    public static toDomainArray(dbRoomieHouses: DbRoomieHouse[]): DomainRoomieHouse[] {
        return dbRoomieHouses.map(dbRoomieHouse => this.toDomain(dbRoomieHouse));
    }
}
