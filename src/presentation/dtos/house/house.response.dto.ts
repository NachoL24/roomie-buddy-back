import { House } from "src/domain/entities";
import { RoomieResponseDto } from "../roomie.response.dto";

export class HouseResponseDto {
    public readonly id: number;
    public readonly name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    static create(house: House): HouseResponseDto {
        return new HouseResponseDto(
            house.id,
            house.name
        );
    }
}