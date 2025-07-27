export class InvitationActionResponseDto {
    public readonly success: boolean;
    public readonly message: string;
    public readonly invitation?: any;

    constructor(success: boolean, message: string, invitation?: any) {
        this.success = success;
        this.message = message;
        this.invitation = invitation;
    }

    static success(message: string, invitation?: any): InvitationActionResponseDto {
        return new InvitationActionResponseDto(true, message, invitation);
    }

    static error(message: string): InvitationActionResponseDto {
        return new InvitationActionResponseDto(false, message);
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            ...(this.invitation && { invitation: this.invitation })
        };
    }
}
