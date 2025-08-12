export class RoomieUpdateDto {
    name: string;
    surname: string;
    document: string;
    picture: string;

    constructor(
        name: string,
        surname: string,
        document: string,
        picture: string
    ) {
        this.name = name;
        this.surname = surname;
        this.document = document;
        this.picture = picture;
    }
}
