import { Invitation as DomainInvitation } from '../../domain/entities/invitation.entity';
import { Invitation as DbInvitation } from '../database/entities/invitation.db-entity';

export class InvitationMapper {
    public static toDomain(dbInvitation: DbInvitation): DomainInvitation {
        return new DomainInvitation(
            dbInvitation.id,
            dbInvitation.house.id,
            dbInvitation.inviter.id,
            dbInvitation.invitee.id,
            dbInvitation.inviterEmail,
            dbInvitation.status as 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED',
            dbInvitation.createdAt,
            dbInvitation.acceptedAt,
            dbInvitation.declinedAt,
            dbInvitation.canceledAt
        );
    }

    public static toDatabase(domainInvitation: DomainInvitation): DbInvitation {
        const dbInvitation = new DbInvitation();
        if (domainInvitation.id) {
            dbInvitation.id = domainInvitation.id;
        }
        dbInvitation.inviterEmail = domainInvitation.inviterEmail;
        dbInvitation.status = domainInvitation.status;
        dbInvitation.createdAt = domainInvitation.createdAt;
        dbInvitation.acceptedAt = domainInvitation.acceptedAt;
        dbInvitation.declinedAt = domainInvitation.declinedAt;
        dbInvitation.canceledAt = domainInvitation.canceledAt;

        // Note: House, inviter and invitee entities need to be set separately
        // when saving, as we only have IDs in the domain entity
        return dbInvitation;
    }

    public static toDomainArray(dbInvitations: DbInvitation[]): DomainInvitation[] {
        return dbInvitations.map(dbInvitation => this.toDomain(dbInvitation));
    }
}
