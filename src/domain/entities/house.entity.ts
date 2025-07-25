export class House {
    public readonly id: number;
    public readonly name: string;
    public readonly createdAt: Date;
    public readonly updatedAt?: Date;
    public readonly deletedAt?: Date;

    constructor(
        id: number,
        name: string,
        createdAt: Date,
        updatedAt?: Date,
        deletedAt?: Date
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public static create(
        name: string,
        id?: number,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date
    ): House {
        return new House(
            id || 0,
            name,
            createdAt || new Date(),
            updatedAt,
            deletedAt
        );
    }
}
