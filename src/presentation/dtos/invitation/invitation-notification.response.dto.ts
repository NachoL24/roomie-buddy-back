import { Invitation } from "src/domain/entities/invitation.entity";

export class InvitationNotificationResponseDto {
    public readonly id: string;
    public readonly houseId: number;
    public readonly houseName: string;
    public readonly inviterName: string;
    public readonly inviterEmail: string;
    public readonly status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED';
    public readonly createdAt: Date;
    public readonly message: string;

    constructor(
        id: string,
        houseId: number,
        houseName: string,
        inviterName: string,
        inviterEmail: string,
        status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED',
        createdAt: Date
    ) {
        this.id = id;
        this.houseId = houseId;
        this.houseName = houseName;
        this.inviterName = inviterName;
        this.inviterEmail = inviterEmail;
        this.status = status;
        this.createdAt = createdAt;
        this.message = this.generateMessage();
    }

    private generateMessage(): string {
        switch (this.status) {
            case 'PENDING':
                return `${this.inviterName} te ha invitado a unirte a "${this.houseName}"`;
            case 'ACCEPTED':
                return `Has aceptado la invitación a "${this.houseName}"`;
            case 'DECLINED':
                return `Has rechazado la invitación a "${this.houseName}"`;
            case 'CANCELED':
                return `La invitación a "${this.houseName}" ha sido cancelada`;
            default:
                return `Invitación a "${this.houseName}"`;
        }
    }

    static create(
        invitation: Invitation,
        houseName: string,
        inviterName: string,
        inviterEmail: string
    ): InvitationNotificationResponseDto {
        return new InvitationNotificationResponseDto(
            invitation.id,
            invitation.houseId,
            houseName,
            inviterName,
            inviterEmail,
            invitation.status,
            invitation.createdAt
        );
    }

    toJSON() {
        return {
            id: this.id,
            houseId: this.houseId,
            houseName: this.houseName,
            inviterName: this.inviterName,
            inviterEmail: this.inviterEmail,
            status: this.status,
            createdAt: this.createdAt,
            message: this.message
        };
    }
}
