export class Invitation {
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

    public static create(
        houseId: number,
        inviterId: number,
        inviteeId: number,
        inviteeEmail: string,
        id?: string,
        status?: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED',
        createdAt?: Date,
        acceptedAt?: Date,
        declinedAt?: Date,
        canceledAt?: Date
    ): Invitation {
        return new Invitation(
            id || '',
            houseId,
            inviterId,
            inviteeId,
            inviteeEmail,
            status || 'PENDING',
            createdAt || new Date(),
            acceptedAt,
            declinedAt,
            canceledAt
        );
    }

    public accept(): Invitation {
        return new Invitation(
            this.id,
            this.houseId,
            this.inviterId,
            this.inviteeId,
            this.inviteeEmail,
            'ACCEPTED',
            this.createdAt,
            new Date(),
            this.declinedAt,
            this.canceledAt
        );
    }

    public decline(): Invitation {
        return new Invitation(
            this.id,
            this.houseId,
            this.inviterId,
            this.inviteeId,
            this.inviteeEmail,
            'DECLINED',
            this.createdAt,
            this.acceptedAt,
            new Date(),
            this.canceledAt
        );
    }

    public cancel(): Invitation {
        return new Invitation(
            this.id,
            this.houseId,
            this.inviterId,
            this.inviteeId,
            this.inviteeEmail,
            'CANCELED',
            this.createdAt,
            this.acceptedAt,
            this.declinedAt,
            new Date()
        );
    }
}
