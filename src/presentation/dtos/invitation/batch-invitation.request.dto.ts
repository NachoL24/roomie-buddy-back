export class BatchInvitationRequestDto {
    public readonly houseId: number;
    public readonly inviteeEmails: string[];

    constructor(houseId: number, inviteeEmails: string[]) {
        this.houseId = houseId;
        this.inviteeEmails = inviteeEmails;
    }

    toJSON() {
        return {
            houseId: this.houseId,
            inviteeEmails: this.inviteeEmails
        };
    }
}
