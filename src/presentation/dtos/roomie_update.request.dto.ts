export class RoomieUpdateDto {
    name: string;
    surname: string;
    email: string;
    document: string;
    picture: string;

    constructor(
        name: string,
        surname: string,
        email: string,
        document: string,
        picture: string
    ) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.document = document;
        this.picture = picture;
    }
}
