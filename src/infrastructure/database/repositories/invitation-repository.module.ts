import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation as DbInvitation } from '../entities/invitation.db-entity';
import { House as DbHouse } from '../entities/house.db-entity';
import { Roomie as DbRoomie } from '../entities/roomie.db-entity';
import { TypeOrmInvitationRepository } from './invitation.repository.impl';

export const INVITATION_REPOSITORY = Symbol('INVITATION_REPOSITORY');

@Module({
    imports: [TypeOrmModule.forFeature([DbInvitation, DbHouse, DbRoomie])],
    providers: [
        TypeOrmInvitationRepository,
        {
            provide: INVITATION_REPOSITORY, // Hexagonal port
            useExisting: TypeOrmInvitationRepository, // Use the same instance
        },
    ],
    exports: [INVITATION_REPOSITORY],
})
export class InvitationRepositoryModule { }
