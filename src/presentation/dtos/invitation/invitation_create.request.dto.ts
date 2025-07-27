export class InvitationCreateDto {
    public readonly houseId: number;
    public readonly inviterId: number;
    public readonly inviteeEmail: string;

    constructor(houseId: number, inviterId: number, inviteeEmail: string) {
        this.houseId = houseId;
        this.inviterId = inviterId;
        this.inviteeEmail = inviteeEmail;
    }

    toJSON() {
        return {
            houseId: this.houseId,
            inviterId: this.inviterId,
            inviteeEmail: this.inviteeEmail
        };
    }
}
