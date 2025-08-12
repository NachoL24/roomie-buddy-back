import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { INVITATION_REPOSITORY, ROOMIE_REPOSITORY, HOUSE_REPO_TOKEN, ROOMIE_HOUSE_REPOSITORY } from "src/infrastructure/database/repositories";
import { Invitation } from "src/domain/entities/invitation.entity";
import { RoomieHouse } from "src/domain/entities/roomie-house.entity";
import { InvitationRepository, RoomieRepository, HouseRepository, RoomieHouseRepository } from "src/domain/repositories";
import { InvitationCreateDto } from "src/presentation/dtos/invitation/invitation_create.request.dto";
import { CreateInvitationRequestDto } from "src/presentation/dtos/invitation/create-invitation.request.dto";
import { InvitationResponseDto } from "src/presentation/dtos/invitation/invitation.response.dto";
import { InvitationsSummaryResponseDto } from "src/presentation/dtos/invitation/invitations-summary.response.dto";

@Injectable()
export class InvitationUseCase {

    constructor(
        @Inject(INVITATION_REPOSITORY) private readonly invitationRepository: InvitationRepository,
        @Inject(ROOMIE_REPOSITORY) private readonly roomieRepository: RoomieRepository,
        @Inject(HOUSE_REPO_TOKEN) private readonly houseRepository: HouseRepository,
        @Inject(ROOMIE_HOUSE_REPOSITORY) private readonly roomieHouseRepository: RoomieHouseRepository,
    ) { }

    async createInvitation(createInvitation: InvitationCreateDto): Promise<InvitationResponseDto> {
        // Verificar que la casa existe
        const house = await this.houseRepository.findById(createInvitation.houseId);
        if (!house) {
            throw new NotFoundException(`House with ID ${createInvitation.houseId} not found`);
        }

        // Verificar que el invitador existe y pertenece a la casa
        const inviter = await this.roomieRepository.findById(createInvitation.inviterId);
        if (!inviter) {
            throw new NotFoundException(`Inviter with ID ${createInvitation.inviterId} not found`);
        }

        // Verificar que el invitador pertenece a la casa
        const roomieHouse = await this.roomieHouseRepository.findByRoomieAndHouse(createInvitation.inviterId, createInvitation.houseId);
        if (!roomieHouse) {
            throw new BadRequestException('You can only invite users to houses you belong to');
        }

        // Verificar que el invitado existe
        const invitee = await this.roomieRepository.findByEmail(createInvitation.inviteeEmail);
        if (!invitee) {
            throw new NotFoundException(`User with email ${createInvitation.inviteeEmail} not found`);
        }

        // Verificar que el invitado no pertenece ya a la casa
        const existingRoomieHouse = await this.roomieHouseRepository.findByRoomieAndHouse(invitee.id, createInvitation.houseId);
        if (existingRoomieHouse) {
            throw new BadRequestException('User is already a member of this house');
        }

        // Verificar que no existe una invitación pendiente para este usuario en esta casa
        const existingInvitations = await this.invitationRepository.findByHouseId(createInvitation.houseId);
        const pendingInvitation = existingInvitations.find(inv =>
            inv.inviterEmail === createInvitation.inviteeEmail && inv.status === 'PENDING'
        );

        if (pendingInvitation) {
            throw new BadRequestException('There is already a pending invitation for this user in this house');
        }

        // Crear la invitación
        const newInvitation = Invitation.create(
            createInvitation.houseId,
            createInvitation.inviterId,
            invitee.id,
            createInvitation.inviteeEmail
        );

        const savedInvitation = await this.invitationRepository.save(newInvitation);
        console.log("New invitation created:", savedInvitation);

        return InvitationResponseDto.create(savedInvitation, house.name, inviter.fullName);
    }

    async createInvitationByAuth0Sub(createInvitationDto: CreateInvitationRequestDto, auth0Sub: string): Promise<InvitationResponseDto> {
        // Obtener el usuario por auth0Sub para conseguir su ID
        const inviter = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!inviter) {
            throw new NotFoundException('User not found');
        }

        // Convertir el DTO del frontend al DTO interno que necesita el use case
        const internalDto = new InvitationCreateDto(
            createInvitationDto.houseId,
            inviter.id,
            createInvitationDto.inviteeEmail
        );

        return await this.createInvitation(internalDto);
    }

    async acceptInvitation(invitationId: string, auth0Sub: string): Promise<InvitationResponseDto> {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
        }

        const house = await this.houseRepository.findById(invitation.houseId);
        if (!house) {
            this.invitationRepository.delete(invitationId);
            throw new NotFoundException(`House with ID ${invitation.houseId} not found`);
        }

        const inviter = await this.roomieRepository.findById(invitation.inviterId);
        if (!inviter) {
            throw new NotFoundException(`User with ID ${invitation.inviterId} not found`);
        }

        // Obtener el usuario por auth0Sub
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verificar que el usuario que acepta es el invitado
        if (invitation.inviteeId !== user.id) {
            throw new BadRequestException('You can only accept invitations sent to you');
        }

        // Verificar que la invitación está pendiente
        if (invitation.status !== 'PENDING') {
            throw new BadRequestException('This invitation is no longer pending');
        }

        // Aceptar la invitación
        const acceptedInvitation = invitation.accept();
        const savedInvitation = await this.invitationRepository.save(acceptedInvitation);

        // Crear la relación RoomieHouse para el nuevo miembro
        const newRoomieHouse = RoomieHouse.create(
            invitation.inviteeId,
            invitation.houseId,
            0 // Se calculará después
        );

        await this.roomieHouseRepository.save(newRoomieHouse);

        // Recalcular el payRatio para todos los miembros de la casa
        await this.recalculatePayRatiosForHouse(invitation.houseId);

        console.log(`User ${invitation.inviteeId} joined house ${invitation.houseId} and payRatios recalculated for all members`);

        return InvitationResponseDto.create(savedInvitation, house.name, inviter.fullName);
    }

    async declineInvitation(invitationId: string, auth0Sub: string): Promise<InvitationResponseDto> {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
        }

        const house = await this.houseRepository.findById(invitation.houseId);
        if (!house) {
            this.invitationRepository.delete(invitationId);
            throw new NotFoundException(`House with ID ${invitation.houseId} not found`);
        }

        const inviter = await this.roomieRepository.findById(invitation.inviterId);
        if (!inviter) {
            throw new NotFoundException(`User with ID ${invitation.inviterId} not found`);
        }

        // Obtener el usuario por auth0Sub
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verificar que el usuario que rechaza es el invitado
        if (invitation.inviteeId !== user.id) {
            throw new BadRequestException('You can only decline invitations sent to you');
        }

        // Verificar que la invitación está pendiente
        if (invitation.status !== 'PENDING') {
            throw new BadRequestException('This invitation is no longer pending');
        }

        // Rechazar la invitación
        const declinedInvitation = invitation.decline();
        const savedInvitation = await this.invitationRepository.save(declinedInvitation);

        console.log("Invitation declined:", savedInvitation);
        return InvitationResponseDto.create(savedInvitation, house.name, inviter.fullName);
    }

    async cancelInvitation(invitationId: string, auth0Sub: string): Promise<InvitationResponseDto> {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
        }

        const house = await this.houseRepository.findById(invitation.houseId);
        if (!house) {
            this.invitationRepository.delete(invitationId);
            throw new NotFoundException(`House with ID ${invitation.houseId} not found`);
        }

        // Obtener el usuario por auth0Sub
        const inviter = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!inviter) {
            throw new NotFoundException('User not found');
        }

        // Verificar que el usuario que cancela es el que envió la invitación
        if (invitation.inviterId !== inviter.id) {
            throw new BadRequestException('You can only cancel invitations you sent');
        }

        // Verificar que la invitación está pendiente
        if (invitation.status !== 'PENDING') {
            throw new BadRequestException('This invitation is no longer pending');
        }

        // Cancelar la invitación
        const canceledInvitation = invitation.cancel();
        const savedInvitation = await this.invitationRepository.save(canceledInvitation);

        console.log("Invitation canceled:", savedInvitation);
        return InvitationResponseDto.create(savedInvitation, house.name, inviter.fullName);
    }

    async getPendingNotificationsByAuth0Sub(auth0Sub: string): Promise<InvitationResponseDto[]> {
        // Obtener invitaciones pendientes recibidas por el usuario usando auth0Sub
        const user = await this.roomieRepository.findByAuth0Sub(auth0Sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const pendingInvitations = await this.invitationRepository.findByPendingInviteeId(user.id);

        // Map async and resolve all to avoid returning an array of unresolved promises
        const results = await Promise.all(
            pendingInvitations.map(async (invitation) => {
                const [house, inviter] = await Promise.all([
                    this.houseRepository.findById(invitation.houseId),
                    this.roomieRepository.findById(invitation.inviterId),
                ]);
                if (!house) {
                    throw new NotFoundException(`House with ID ${invitation.houseId} not found`);
                }
                if (!inviter) {
                    throw new NotFoundException(`Inviter with ID ${invitation.inviterId} not found`);
                }
                return InvitationResponseDto.create(invitation, house.name, inviter.fullName);
            })
        );
        return results;
    }

    async getInvitationsByHouseId(houseId: number): Promise<InvitationResponseDto[]> {
        const house = await this.houseRepository.findById(houseId);
        if (!house) {
            throw new NotFoundException(`House with ID ${houseId} not found`);
        }

        const invitations = await this.invitationRepository.findByHouseId(houseId);
        const results = await Promise.all(
            invitations.map(async (invitation) => {
                const inviter = await this.roomieRepository.findById(invitation.inviterId);
                if (!inviter) {
                    throw new NotFoundException(`Inviter with ID ${invitation.inviterId} not found`);
                }
                return InvitationResponseDto.create(invitation, house.name, inviter.fullName);
            })
        );
        return results;
    }

    /**
     * Recalcula el payRatio para todos los miembros de una casa dividiéndolo en partes iguales
     * @param houseId ID de la casa
     */
    private async recalculatePayRatiosForHouse(houseId: number): Promise<void> {
        // Obtener todos los miembros actuales de la casa
        const allMembers = await this.roomieHouseRepository.findByHouseId(houseId);

        if (allMembers.length === 0) {
            console.log(`No members found for house ${houseId}`);
            return;
        }

        // Calcular el nuevo payRatio (dividido en partes iguales)
        const newPayRatio = 1.0 / allMembers.length;

        console.log(`Recalculating payRatio for house ${houseId}: ${allMembers.length} members, each gets ${newPayRatio}`);

        // Actualizar el payRatio para cada miembro
        const updatePromises = allMembers.map(async (member) => {
            const updatedMember = RoomieHouse.create(
                member.roomieId,
                member.houseId,
                newPayRatio
            );
            return await this.roomieHouseRepository.save(updatedMember);
        });

        await Promise.all(updatePromises);
        console.log(`PayRatios updated for all ${allMembers.length} members of house ${houseId}`);
    }
}
