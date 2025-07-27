import { Invitation } from "src/domain/entities/invitation.entity";

export class InvitationResponseDto {
    public readonly id: string;
    public readonly houseId: number;
    public readonly inviterId: number;
    public readonly inviteeId: number;
    public readonly inviteeEmail: string;
    public readonly status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED';
    public readonly createdAt: Date;
    public readonly acceptedAt?: Date;
    public readonly declinedAt?: Date;
    public readonly canceledAt?: Date;

    constructor(
        id: string,
        houseId: number,
        inviterId: number,
        inviteeId: number,
        inviteeEmail: string,
        status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED',
        createdAt: Date,
        acceptedAt?: Date,
        declinedAt?: Date,
        canceledAt?: Date
    ) {
        this.id = id;
        this.houseId = houseId;
        this.inviterId = inviterId;
        this.inviteeId = inviteeId;
        this.inviteeEmail = inviteeEmail;
        this.status = status;
        this.createdAt = createdAt;
        this.acceptedAt = acceptedAt;
        this.declinedAt = declinedAt;
        this.canceledAt = canceledAt;
    }

    static create(invitation: Invitation): InvitationResponseDto {
        return new InvitationResponseDto(
            invitation.id,
            invitation.houseId,
            invitation.inviterId,
            invitation.inviteeId,
            invitation.inviteeEmail,
            invitation.status,
            invitation.createdAt,
            invitation.acceptedAt,
            invitation.declinedAt,
            invitation.canceledAt
        );
    }

    toJSON() {
        return {
            id: this.id,
            houseId: this.houseId,
            inviterId: this.inviterId,
            inviteeId: this.inviteeId,
            inviteeEmail: this.inviteeEmail,
            status: this.status,
            createdAt: this.createdAt,
            acceptedAt: this.acceptedAt,
            declinedAt: this.declinedAt,
            canceledAt: this.canceledAt
        };
    }
}
