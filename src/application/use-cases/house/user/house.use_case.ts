import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { HOUSE_REPO_TOKEN, ROOMIE_HOUSE_REPOSITORY } from "src/infrastructure/database/repositories";
import { House } from "src/domain/entities/house.entity";
import { RoomieHouse } from "src/domain/entities/roomie-house.entity";
import { HouseCreateDto } from "src/presentation/dtos/house/house_create.request.dto";
import { HouseResponseDto } from "src/presentation/dtos/house/house.response.dto";
import { HouseRepository, RoomieHouseRepository } from "src/domain/repositories";

@Injectable()
export class HouseUseCase {

    constructor(
        @Inject(HOUSE_REPO_TOKEN) private readonly houseRepository: HouseRepository,
        @Inject(ROOMIE_HOUSE_REPOSITORY) private readonly roomieHouseRepository: RoomieHouseRepository,
    ) { }

    async getHouseById(houseId: number): Promise<HouseResponseDto> {
        const house = await this.houseRepository.findById(houseId);
        if (!house) {
            throw new NotFoundException(`House with ID ${houseId} not found`);
        }
        return HouseResponseDto.create(house);
    }

    async createHouse(createHouse: HouseCreateDto): Promise<HouseResponseDto> {
        // Crear la casa
        const newHouse = House.create(createHouse);
        const savedHouse = await this.houseRepository.save(newHouse);
        if (!savedHouse) {
            throw new Error("Failed to create house");
        }

        // Crear la relación RoomieHouse con el creador
        const roomieHouse = RoomieHouse.create(
            createHouse.createdBy,
            savedHouse.id,
            1.0 // El creador tiene ratio de pago completo por defecto
        );

        await this.roomieHouseRepository.save(roomieHouse);

        console.log("New house created:", savedHouse);
        console.log("RoomieHouse relationship created for creator:", roomieHouse);

        return HouseResponseDto.create(savedHouse);
    }

    async removeHouse(houseId: number): Promise<void> {
        const house = await this.houseRepository.findById(houseId);
        if (!house) {
            throw new NotFoundException(`House with ID ${houseId} not found`);
        }
        await this.houseRepository.delete(houseId);
        console.log(`House with ID ${houseId} removed successfully`);
    }

    async getHousesByRoomieId(roomieId: number): Promise<HouseResponseDto[]> {
        const houses = await this.houseRepository.findByRoomieId(roomieId);
        return houses.map(house => HouseResponseDto.create(house));
    }

}

