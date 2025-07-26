import { RoomieUpdateDto } from "src/presentation/dtos/roomie_update.request.dto";

export class Roomie {
    public readonly id: number;
    public readonly name: string;
    public readonly surname: string;
    public readonly document?: string;
    public readonly email: string;
    public readonly auth0Sub: string;
    public readonly picture?: string;
    public readonly createdAt: Date;
    public readonly updatedAt?: Date;
    public readonly deletedAt?: Date;

    constructor(
        id: number,
        name: string,
        surname: string,
        email: string,
        createdAt: Date,
        auth0Sub: string,
        document?: string,
        picture?: string,
        updatedAt?: Date,
        deletedAt?: Date
    ) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.createdAt = createdAt;
        this.document = document;
        this.auth0Sub = auth0Sub;
        this.picture = picture;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public static create(
        name: string,
        surname: string,
        email: string,
        auth0Sub: string,
        id?: number,
        document?: string,
        picture?: string,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date
    ): Roomie {
        return new Roomie(
            id || 0,
            name,
            surname,
            email,
            createdAt || new Date(),
            auth0Sub,
            document,
            picture,
            updatedAt,
            deletedAt
        );
    }

    public get fullName(): string {
        return `${this.name} ${this.surname}`;
    }

    public static updateFrom(existing: Roomie, dto: RoomieUpdateDto): Roomie {
        return new Roomie(
            existing.id,
            dto.name || existing.name,
            dto.surname || existing.surname,
            dto.email || existing.email,
            existing.createdAt,
            existing.auth0Sub,
            dto.document !== undefined ? dto.document : existing.document,
            dto.picture !== undefined ? dto.picture : existing.picture,
            new Date(), // updatedAt
            existing.deletedAt
        );
    }
}
