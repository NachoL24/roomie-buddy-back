import { Auth0ManagementApiAdapter } from 'src/infrastructure/external-services/auth0/auth0-managementapi.adapter';
import { Inject, Injectable } from "@nestjs/common";
import { AuthenticatedUserDto } from "src/application/dto/user/authenticated-user.dto";
import { House, Roomie } from "src/domain/entities";
import { RoomieRepository } from "src/domain/repositories";
import { ROOMIE_REPOSITORY } from "src/infrastructure/database/repositories";
import { Auth0Profile, Auth0UserinfoAdapter } from "src/infrastructure/external-services/auth0/auth0-userInfo.adapter";
import { RoomieResponseDto } from "src/presentation/dtos/roomie.response.dto";
import { RoomieUpdateDto } from "src/presentation/dtos/roomie_update.request.dto";
import { HouseResponseDto } from 'src/presentation/dtos/house/house.response.dto';

@Injectable()
export class UserUseCase {
    
    getUserByEmail(email: string): any {
        return this.roomieRepository.find5ByEmail(email);
    }

    constructor(@Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository, private readonly auth0UserinfoAdapter: Auth0UserinfoAdapter, private readonly auth0ManagementApiAdapter: Auth0ManagementApiAdapter) { }

    async getUserOrCreateUser(auth0Payload: AuthenticatedUserDto): Promise<RoomieResponseDto> {
        // 1. Intentar encontrar usuario por Auth0 Sub
        console.log("Fetching user by Auth0 Sub:", auth0Payload.sub);
        let existingUser = await this.roomieRepository.findByAuth0Sub(auth0Payload.sub);

        console.log("fetching user info")
        const userInfo = await this.auth0UserinfoAdapter.fetchProfile(auth0Payload.accessToken);
        console.log("Fetched user info:", userInfo);
        if (existingUser) {
            const updatedRoomie = Roomie.updateFromAuth0(existingUser, auth0Payload);
            await this.roomieRepository.save(updatedRoomie);
            return RoomieResponseDto.fromDomain(updatedRoomie);
        }
        console.log("No existing user found by Auth0 Sub");
        if (!userInfo) {
            throw new Error('No se pudo obtener la información del usuario, intentelo mas tarde');
        }

        // 2. Si no existe por Auth0 Sub, buscar por email (usuarios migrados)
        existingUser = await this.roomieRepository.findByEmail(userInfo.email);

        if (existingUser) {
            // Vincular Auth0 Sub al usuario existente
            const updatedUser = this.linkAuth0ToExistingUser(existingUser, auth0Payload.sub);
            const savedUser = await this.roomieRepository.save(updatedUser);
            console.log("Updated existing user with Auth0 Sub:", savedUser);
            return RoomieResponseDto.fromDomain(savedUser);
        }

        // 3. Crear nuevo usuario
        const newUser = await this.createUserFromAuth0(userInfo);

        const roomieDto = RoomieResponseDto.fromDomain(newUser);
        console.log("Created Roomie DTO:", roomieDto);
        return roomieDto;
    }

    async getUserByAuth0Sub(auth0Sub: string): Promise<Roomie | null> {
        return await this.roomieRepository.findByAuth0Sub(auth0Sub);
    }

    async getUserById(id: number): Promise<Roomie | null> {
        return await this.roomieRepository.findById(id);
    }

    private async createUserFromAuth0(auth0Payload: Auth0Profile): Promise<Roomie> {
        const name = auth0Payload.given_name || auth0Payload.name?.split(' ')[0] || 'Usuario';
        const surname = auth0Payload.family_name || auth0Payload.name?.split(' ').slice(1).join(' ') || '';

        const newUser = Roomie.create(
            name,
            surname,
            auth0Payload.email,
            auth0Payload.sub, // auth0Sub
            undefined, // id será asignado por la base de datos
            undefined, // document
            auth0Payload.picture // picture
        );

        return await this.roomieRepository.save(newUser);
    }

    private linkAuth0ToExistingUser(existingUser: Roomie, auth0Sub: string): Roomie {
        return Roomie.create(
            existingUser.name,
            existingUser.surname,
            existingUser.email,
            auth0Sub, // Agregar auth0Sub
            existingUser.id,
            existingUser.document,
            existingUser.picture,
            existingUser.createdAt,
            new Date() // updatedAt
        );
    }

    async updateUser(user: AuthenticatedUserDto, dto: RoomieUpdateDto, id: number): Promise<any> {
        console.log("UserUseCase - updateUser called for userId:", id, "with data:", dto);
        const existingRoomie = await this.roomieRepository.findById(id);

        if (!existingRoomie) {
            throw new Error('Usuario no encontrado');
        }

        if (existingRoomie.auth0Sub !== user.sub) {
            throw new Error('Solo puedes actualizar tu propio perfil');
        }

        console.log("Existing Roomie found:", existingRoomie);
        const updatedRoomie = Roomie.updateFrom(existingRoomie, dto);

        this.checkProfileCompletion(updatedRoomie);
        
        console.log("Updated Roomie before saving:", updatedRoomie);
        await this.roomieRepository.save(updatedRoomie);

        console.log("Updated Roomie saved successfully:", updatedRoomie);
        return RoomieResponseDto.fromDomain(updatedRoomie);
    }

    private checkProfileCompletion(updatedRoomie: Roomie): void {
        const isProfileComplete = !!(updatedRoomie.name && updatedRoomie.surname && updatedRoomie.email && updatedRoomie.document && updatedRoomie.picture);
        if (!isProfileComplete) {
            throw new Error('El perfil no está completo. Asegúrate de proporcionar todos los campos requeridos.');
        }
        console.log("Profile completion status:", isProfileComplete);
        this.auth0ManagementApiAdapter.updateUserMetadata(updatedRoomie.auth0Sub, { profile_complete: isProfileComplete });
    }
}

