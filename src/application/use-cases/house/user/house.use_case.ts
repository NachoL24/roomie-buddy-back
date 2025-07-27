import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { HOUSE_REPO_TOKEN, ROOMIE_HOUSE_REPOSITORY, ROOMIE_REPOSITORY } from "src/infrastructure/database/repositories";
import { House } from "src/domain/entities/house.entity";
import { RoomieHouse } from "src/domain/entities/roomie-house.entity";
import { HouseCreateDto } from "src/presentation/dtos/house/house_create.request.dto";
import { HouseResponseDto } from "src/presentation/dtos/house/house.response.dto";
import { HouseWithMembersResponseDto, HouseMemberDto } from "src/presentation/dtos/house/house-with-members.response.dto";
import { UpdatePayRatiosRequestDto } from "src/presentation/dtos/house/update-pay-ratios.request.dto";
import { UpdatePayRatiosResponseDto } from "src/presentation/dtos/house/update-pay-ratios.response.dto";
import { HouseRepository, RoomieHouseRepository, RoomieRepository } from "src/domain/repositories";

@Injectable()
export class HouseUseCase {

    constructor(
        @Inject(HOUSE_REPO_TOKEN) private readonly houseRepository: HouseRepository,
        @Inject(ROOMIE_HOUSE_REPOSITORY) private readonly roomieHouseRepository: RoomieHouseRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
    ) { }

    async getHouseById(houseId: number): Promise<HouseWithMembersResponseDto> {
        const house = await this.houseRepository.findById(houseId);
        if (!house) {
            throw new NotFoundException(`House with ID ${houseId} not found`);
        }

        // Obtener todos los miembros de la casa
        const roomieHouses = await this.roomieHouseRepository.findByHouseId(houseId);

        // Obtener la información completa de cada miembro
        const membersPromises = roomieHouses.map(async (roomieHouse) => {
            const roomie = await this.roomieRepository.findById(roomieHouse.roomieId);
            if (!roomie) {
                console.warn(`Roomie with ID ${roomieHouse.roomieId} not found for house ${houseId}`);
                return null;
            }
            return HouseMemberDto.create(roomie, roomieHouse);
        });

        const membersResults = await Promise.all(membersPromises);
        const members = membersResults.filter(member => member !== null) as HouseMemberDto[];

        return HouseWithMembersResponseDto.create(house, members);
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

    async updatePayRatios(houseId: number, updatePayRatiosDto: UpdatePayRatiosRequestDto, auth0Sub: string): Promise<UpdatePayRatiosResponseDto> {
        // Verificar que la casa existe
        const house = await this.houseRepository.findById(houseId);
        if (!house) {
            throw new NotFoundException(`House with ID ${houseId} not found`);
        }

        // Obtener el usuario por auth0Sub
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verificar que el usuario pertenece a la casa
        const userMembership = await this.roomieHouseRepository.findByRoomieAndHouse(user.id, houseId);
        if (!userMembership) {
            throw new BadRequestException('You can only update payRatios for houses you belong to');
        }

        // Obtener todos los miembros actuales de la casa
        const currentMembers = await this.roomieHouseRepository.findByHouseId(houseId);
        const currentMemberIds = currentMembers.map(member => member.roomieId);

        // Validar que todos los roomieId en la solicitud son miembros actuales
        const requestedRoomieIds = updatePayRatiosDto.payRatios.map(item => item.roomieId);
        const invalidRoomieIds = requestedRoomieIds.filter(id => !currentMemberIds.includes(id));

        if (invalidRoomieIds.length > 0) {
            throw new BadRequestException(`The following users are not members of this house: ${invalidRoomieIds.join(', ')}`);
        }

        // Validar que se proporcionan payRatios para todos los miembros actuales
        const missingRoomieIds = currentMemberIds.filter(id => !requestedRoomieIds.includes(id));
        if (missingRoomieIds.length > 0) {
            throw new BadRequestException(`PayRatios must be provided for all current members. Missing: ${missingRoomieIds.join(', ')}`);
        }

        // Validar que la suma de payRatios es 1.0 (100%)
        const totalPayRatio = updatePayRatiosDto.payRatios.reduce((sum, item) => sum + item.payRatio, 0);
        if (Math.abs(totalPayRatio - 1.0) > 0.001) { // Permitir pequeña tolerancia por errores de punto flotante
            throw new BadRequestException(`Total payRatios must equal 1.0 (100%). Current total: ${totalPayRatio}`);
        }

        // Validar que todos los payRatios son positivos
        const invalidPayRatios = updatePayRatiosDto.payRatios.filter(item => item.payRatio <= 0);
        if (invalidPayRatios.length > 0) {
            throw new BadRequestException('All payRatios must be greater than 0');
        }

        // Actualizar los payRatios de los miembros existentes
        const updatePromises = updatePayRatiosDto.payRatios.map(async (item) => {
            // Buscar el miembro existente
            const existingMember = currentMembers.find(member => member.roomieId === item.roomieId);
            if (!existingMember) {
                throw new BadRequestException(`Member with roomieId ${item.roomieId} not found`);
            }

            // Crear una nueva instancia con el payRatio actualizado
            const updatedMember = RoomieHouse.create(
                existingMember.roomieId,
                existingMember.houseId,
                item.payRatio
            );
            return await this.roomieHouseRepository.save(updatedMember);
        });

        const updatedMembers = await Promise.all(updatePromises);

        console.log(`PayRatios updated for house ${houseId} by user ${user.id}:`,
            updatePayRatiosDto.payRatios.map(item => `Roomie ${item.roomieId}: ${item.payRatio}`));

        return UpdatePayRatiosResponseDto.create(updatedMembers);
    }

}

