import { Roomie } from "src/domain/entities/roomie.entity";

export class RoomieResponseDto {
    id: number;
    name: string;
    surname: string;
    email: string;
    auth0Sub: string;
    profileCompleted: boolean;
    document?: string;
    picture?: string;

    constructor(
        id: number,
        name: string,
        surname: string,
        email: string,
        profileCompleted: boolean,
        auth0Sub: string,
        document?: string,
        picture?: string
    ) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.auth0Sub = auth0Sub;
        this.profileCompleted = profileCompleted;
        this.document = document;
        this.picture = picture;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            surname: this.surname,
            email: this.email,
            auth0Sub: this.auth0Sub,
            profileCompleted: this.profileCompleted,
            document: this.document,
            picture: this.picture
        };
    }

    static create(
        name: string,
        surname: string,
        email: string,
        auth0Sub: string,
        id?: number,
        document?: string,
        picture?: string
    ): RoomieResponseDto {
        var profileCompleted = false;
        if (name && surname && email && document && picture) {
            profileCompleted = true;
        }
        return new RoomieResponseDto(
            id || 0,
            name,
            surname,
            email,
            profileCompleted,
            auth0Sub,
            document,
            picture
        );
    }

    static fromDomain(roomie: Roomie): RoomieResponseDto {
        return new RoomieResponseDto(
            roomie.id,
            roomie.name,
            roomie.surname,
            roomie.email,
            !!(roomie.name && roomie.surname && roomie.email && roomie.document && roomie.picture),
            roomie.auth0Sub,
            roomie.document,
            roomie.picture
        );
    }
}
