import { InvitationResponseDto } from "./invitation.response.dto";

export class InvitationsSummaryResponseDto {
    public readonly pending: number;
    public readonly accepted: number;
    public readonly declined: number;
    public readonly canceled: number;
    public readonly total: number;
    public readonly pendingInvitations: InvitationResponseDto[];

    constructor(
        pending: number,
        accepted: number,
        declined: number,
        canceled: number,
        total: number,
        pendingInvitations: InvitationResponseDto[]
    ) {
        this.pending = pending;
        this.accepted = accepted;
        this.declined = declined;
        this.canceled = canceled;
        this.total = total;
        this.pendingInvitations = pendingInvitations;
    }

    static create(invitations: InvitationResponseDto[]): InvitationsSummaryResponseDto {
        const pending = invitations.filter(inv => inv.status === 'PENDING').length;
        const accepted = invitations.filter(inv => inv.status === 'ACCEPTED').length;
        const declined = invitations.filter(inv => inv.status === 'DECLINED').length;
        const canceled = invitations.filter(inv => inv.status === 'CANCELED').length;
        const total = invitations.length;
        const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING');

        return new InvitationsSummaryResponseDto(
            pending,
            accepted,
            declined,
            canceled,
            total,
            pendingInvitations
        );
    }

    toJSON() {
        return {
            summary: {
                pending: this.pending,
                accepted: this.accepted,
                declined: this.declined,
                canceled: this.canceled,
                total: this.total
            },
            pendingInvitations: this.pendingInvitations
        };
    }
}
