import { House as DomainHouse } from '../../domain/entities/house.entity';
import { House as DbHouse } from '../database/entities/house.db-entity';

export class HouseMapper {
    public static toDomain(dbHouse: DbHouse): DomainHouse {
        return new DomainHouse(
            dbHouse.id,
            dbHouse.name,
            dbHouse.createdAt,
            dbHouse.updatedAt,
            dbHouse.deletedAt
        );
    }

    public static toDatabase(domainHouse: DomainHouse): DbHouse {
        const dbHouse = new DbHouse();
        if (domainHouse.id !== 0) {
            dbHouse.id = domainHouse.id;
        }
        dbHouse.name = domainHouse.name;
        dbHouse.createdAt = domainHouse.createdAt;
        dbHouse.updatedAt = domainHouse.updatedAt;
        dbHouse.deletedAt = domainHouse.deletedAt;
        return dbHouse;
    }

    public static toDomainArray(dbHouses: DbHouse[]): DomainHouse[] {
        return dbHouses.map(dbHouse => this.toDomain(dbHouse));
    }
}
