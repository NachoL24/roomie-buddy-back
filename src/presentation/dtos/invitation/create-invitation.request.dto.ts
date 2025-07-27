export class CreateInvitationRequestDto {
    public readonly houseId: number;
    public readonly inviteeEmail: string;

    constructor(houseId: number, inviteeEmail: string) {
        this.houseId = houseId;
        this.inviteeEmail = inviteeEmail;
    }

    toJSON() {
        return {
            houseId: this.houseId,
            inviteeEmail: this.inviteeEmail
        };
    }
}
