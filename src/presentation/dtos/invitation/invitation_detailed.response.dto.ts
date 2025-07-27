import { Invitation } from "src/domain/entities/invitation.entity";
import { HouseResponseDto } from "../house/house.response.dto";
import { RoomieResponseDto } from "../roomie.response.dto";

export class InvitationDetailedResponseDto {
    public readonly id: string;
    public readonly house: HouseResponseDto;
    public readonly inviter: RoomieResponseDto;
    public readonly invitee: RoomieResponseDto;
    public readonly inviteeEmail: string;
    public readonly status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED';
    public readonly createdAt: Date;
    public readonly acceptedAt?: Date;
    public readonly declinedAt?: Date;
    public readonly canceledAt?: Date;

    constructor(
        id: string,
        house: HouseResponseDto,
        inviter: RoomieResponseDto,
        invitee: RoomieResponseDto,
        inviteeEmail: string,
        status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED',
        createdAt: Date,
        acceptedAt?: Date,
        declinedAt?: Date,
        canceledAt?: Date
    ) {
        this.id = id;
        this.house = house;
        this.inviter = inviter;
        this.invitee = invitee;
        this.inviteeEmail = inviteeEmail;
        this.status = status;
        this.createdAt = createdAt;
        this.acceptedAt = acceptedAt;
        this.declinedAt = declinedAt;
        this.canceledAt = canceledAt;
    }

    toJSON() {
        return {
            id: this.id,
            house: this.house,
            inviter: this.inviter,
            invitee: this.invitee,
            inviteeEmail: this.inviteeEmail,
            status: this.status,
            createdAt: this.createdAt,
            acceptedAt: this.acceptedAt,
            declinedAt: this.declinedAt,
            canceledAt: this.canceledAt
        };
    }
}
