import { Invitation } from "src/domain/entities/invitation.entity";

export class InvitationResponseDto {
    public readonly id: string;
    public readonly houseId: number;
    public readonly houseName: string;
    public readonly inviterId: number;
    public readonly inviteeId: number;
    public readonly inviterName: string;
    public readonly inviterEmail: string;
    public readonly status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED';
    public readonly createdAt: Date;
    public readonly acceptedAt?: Date;
    public readonly declinedAt?: Date;
    public readonly canceledAt?: Date;

    constructor(
        id: string,
        houseId: number,
        houseName: string,
        inviterId: number,
        inviteeId: number,
        inviterName: string,
        inviterEmail: string,
        status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED',
        createdAt: Date,
        acceptedAt?: Date,
        declinedAt?: Date,
        canceledAt?: Date
    ) {
        this.id = id;
        this.houseId = houseId;
        this.houseName = houseName;
        this.inviterId = inviterId;
        this.inviteeId = inviteeId;
        this.inviterName = inviterName;
        this.inviterEmail = inviterEmail;
        this.status = status;
        this.createdAt = createdAt;
        this.acceptedAt = acceptedAt;
        this.declinedAt = declinedAt;
        this.canceledAt = canceledAt;
    }

    static create(invitation: Invitation, houseName: string, inviterName: string): InvitationResponseDto {
        return new InvitationResponseDto(
            invitation.id,
            invitation.houseId,
            houseName,
            invitation.inviterId,
            invitation.inviteeId,
            inviterName,
            invitation.inviterEmail,
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
            houseName: this.houseName,
            inviterId: this.inviterId,
            inviteeId: this.inviteeId,
            inviterName: this.inviterName,
            inviteeEmail: this.inviterEmail,
            status: this.status,
            createdAt: this.createdAt,
            acceptedAt: this.acceptedAt,
            declinedAt: this.declinedAt,
            canceledAt: this.canceledAt
        };
    }
}
