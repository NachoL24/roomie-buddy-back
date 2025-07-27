import { Body, Controller, Get, Param, Post, Put, UseGuards, Request, HttpStatus, HttpCode, ParseIntPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfileCompletedGuard } from "../guards/profile-completed.guard";
import { InvitationUseCase } from "src/application/use-cases/invitation/invitation.use_case";
import { InvitationResponseDto } from "../dtos/invitation/invitation.response.dto";
import { CreateInvitationRequestDto } from "../dtos/invitation/create-invitation.request.dto";
import { InvitationsSummaryResponseDto } from "../dtos/invitation/invitations-summary.response.dto";
import { User } from "../decorators/user.decorator";
import { AuthenticatedUserDto } from "src/application/dto/user/authenticated-user.dto";

@Controller('invitations')
@UseGuards(AuthGuard('jwt'), ProfileCompletedGuard)
export class InvitationController {

    constructor(
        private readonly invitationUseCase: InvitationUseCase
    ) { }

    /**
     * Crear una nueva invitación para un usuario
     * POST /invitations
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createInvitation(
        @Body() createInvitationDto: CreateInvitationRequestDto,
        @User() user: AuthenticatedUserDto
    ): Promise<InvitationResponseDto> {
        return await this.invitationUseCase.createInvitationByAuth0Sub(createInvitationDto, user.sub);
    }

    /**
     * Aceptar una invitación
     * PUT /invitations/:id/accept
     */
    @Put(':id/accept')
    @HttpCode(HttpStatus.OK)
    async acceptInvitation(
        @Param('id') invitationId: string,
        @User() user: AuthenticatedUserDto
    ): Promise<{ message: string; invitation: InvitationResponseDto }> {
        const invitation = await this.invitationUseCase.acceptInvitation(invitationId, user.sub);
        return {
            message: 'Invitación aceptada exitosamente. ¡Bienvenido al grupo!',
            invitation
        };
    }

    /**
     * Rechazar una invitación
     * PUT /invitations/:id/decline
     */
    @Put(':id/decline')
    @HttpCode(HttpStatus.OK)
    async declineInvitation(
        @Param('id') invitationId: string,
        @User() user: AuthenticatedUserDto
    ): Promise<{ message: string; invitation: InvitationResponseDto }> {
        const invitation = await this.invitationUseCase.declineInvitation(invitationId, user.sub);
        return {
            message: 'Invitación rechazada.',
            invitation
        };
    }

    /**
     * Cancelar una invitación que se envió
     * PUT /invitations/:id/cancel
     */
    @Put(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancelInvitation(
        @Param('id') invitationId: string,
        @User() user: AuthenticatedUserDto
    ): Promise<{ message: string; invitation: InvitationResponseDto }> {
        const invitation = await this.invitationUseCase.cancelInvitation(invitationId, user.sub);
        return {
            message: 'Invitación cancelada exitosamente.',
            invitation
        };
    }

    /**
     * Obtener todas las invitaciones del usuario autenticado
     * GET /invitations/my-invitations
     */
    @Get('my-invitations')
    async getMyInvitations(@User() user: AuthenticatedUserDto): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getInvitationsByAuth0Sub(user.sub);
    }

    /**
     * Obtener todas las invitaciones enviadas por el usuario autenticado
     * GET /invitations/my-invitations/sent
     */
    @Get('my-invitations/sent')
    async getMySentInvitations(@User() user: AuthenticatedUserDto): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getSentInvitationsByAuth0Sub(user.sub);
    }

    /**
     * Obtener todas las invitaciones recibidas por el usuario autenticado
     * GET /invitations/my-invitations/received
     */
    @Get('my-invitations/received')
    async getMyReceivedInvitations(@User() user: AuthenticatedUserDto): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getReceivedInvitationsByAuth0Sub(user.sub);
    }

    /**
     * Obtener resumen de invitaciones del usuario autenticado
     * GET /invitations/my-invitations/summary
     */
    @Get('my-invitations/summary')
    async getMyInvitationsSummary(@User() user: AuthenticatedUserDto): Promise<InvitationsSummaryResponseDto> {
        return await this.invitationUseCase.getInvitationsSummaryByAuth0Sub(user.sub);
    }

    /**
     * Obtener invitaciones por ID de usuario (admin endpoint)
     * GET /invitations/user/:userId
     */
    @Get('user/:userId')
    async getInvitationsByUserId(@Param('userId') userId: number): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getInvitationsByUserId(userId);
    }

    /**
     * Obtener invitaciones pendientes por ID de usuario (admin endpoint)
     * GET /invitations/user/:userId/pending
     */
    @Get('user/:userId/pending')
    async getPendingInvitationsByUserId(@Param('userId') userId: number): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getPendingInvitationsByUserId(userId);
    }

    /**
     * Obtener invitaciones por ID de casa
     * GET /invitations/house/:houseId
     */
    @Get('house/:houseId')
    async getInvitationsByHouseId(@Param('houseId') houseId: number): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getInvitationsByHouseId(houseId);
    }

    /**
     * Obtener notificaciones de invitaciones pendientes para el usuario autenticado
     * Este es el endpoint principal que debe consumir el frontend para mostrar notificaciones
     * GET /invitations/notifications
     */
    @Get('notifications')
    async getNotifications(@User() user: AuthenticatedUserDto): Promise<InvitationResponseDto[]> {
        return await this.invitationUseCase.getPendingNotificationsByAuth0Sub(user.sub);
    }
}
