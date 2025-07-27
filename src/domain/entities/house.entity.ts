import { HouseCreateDto } from "src/presentation/dtos/house/house_create.request.dto";

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
        dto: HouseCreateDto
    ): House {
        return new House(
            0,
            dto.name,
            new Date()
        );
    }

    public static createWithUpdatedName(
        existingHouse: House,
        newName: string
    ): House {
        return new House(
            existingHouse.id,
            newName,
            existingHouse.createdAt,
            new Date(),
            existingHouse.deletedAt
        );
    }
}
