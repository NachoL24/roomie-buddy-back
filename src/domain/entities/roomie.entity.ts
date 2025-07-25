export class Roomie {
    public readonly id: number;
    public readonly name: string;
    public readonly surname: string;
    public readonly document?: string;
    public readonly email: string;
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
        this.picture = picture;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public static create(
        name: string,
        surname: string,
        email: string,
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
            document,
            picture,
            updatedAt,
            deletedAt
        );
    }

    public get fullName(): string {
        return `${this.name} ${this.surname}`;
    }
}
