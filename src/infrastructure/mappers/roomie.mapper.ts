import { Roomie as DomainRoomie } from '../../domain/entities/roomie.entity';
import { Roomie as DbRoomie } from '../database/entities/roomie.db-entity';

export class RoomieMapper {
    public static toDomain(dbRoomie: DbRoomie): DomainRoomie {
        return new DomainRoomie(
            dbRoomie.id,
            dbRoomie.name,
            dbRoomie.surname,
            dbRoomie.email,
            dbRoomie.createdAt,
            dbRoomie.document,
            dbRoomie.picture,
            dbRoomie.updatedAt,
            dbRoomie.deletedAt
        );
    }

    public static toDatabase(domainRoomie: DomainRoomie): DbRoomie {
        const dbRoomie = new DbRoomie();
        if (domainRoomie.id !== 0) {
            dbRoomie.id = domainRoomie.id;
        }
        dbRoomie.name = domainRoomie.name;
        dbRoomie.surname = domainRoomie.surname;
        dbRoomie.email = domainRoomie.email;
        dbRoomie.document = domainRoomie.document;
        dbRoomie.picture = domainRoomie.picture;
        dbRoomie.createdAt = domainRoomie.createdAt;
        dbRoomie.updatedAt = domainRoomie.updatedAt;
        dbRoomie.deletedAt = domainRoomie.deletedAt;
        return dbRoomie;
    }

    public static toDomainArray(dbRoomies: DbRoomie[]): DomainRoomie[] {
        return dbRoomies.map(dbRoomie => this.toDomain(dbRoomie));
    }
}
