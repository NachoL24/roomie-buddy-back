import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation as DomainInvitation } from '../../../domain/entities/invitation.entity';
import { InvitationRepository } from '../../../domain/repositories/invitation.repository';
import { Invitation as DbInvitation } from '../entities/invitation.db-entity';
import { House as DbHouse } from '../entities/house.db-entity';
import { Roomie as DbRoomie } from '../entities/roomie.db-entity';
import { InvitationMapper } from '../../mappers/invitation.mapper';

@Injectable()
export class TypeOrmInvitationRepository implements InvitationRepository {
    constructor(
        @InjectRepository(DbInvitation)
        private readonly invitationRepository: Repository<DbInvitation>,
        @InjectRepository(DbHouse)
        private readonly houseRepository: Repository<DbHouse>,
        @InjectRepository(DbRoomie)
        private readonly roomieRepository: Repository<DbRoomie>
    ) { }

    async findById(id: string): Promise<DomainInvitation | null> {
        const dbInvitation = await this.invitationRepository.findOne({
            where: { id },
            relations: ['house', 'inviter', 'invitee']
        });
        return dbInvitation ? InvitationMapper.toDomain(dbInvitation) : null;
    }

    async findByInviteeEmail(email: string): Promise<DomainInvitation[]> {
        const dbInvitations = await this.invitationRepository.find({
            where: { inviteeEmail: email },
            relations: ['house', 'inviter', 'invitee']
        });
        return InvitationMapper.toDomainArray(dbInvitations);
    }

    async findByInviterId(inviterId: number): Promise<DomainInvitation[]> {
        const dbInvitations = await this.invitationRepository.find({
            where: { inviter: { id: inviterId } },
            relations: ['house', 'inviter', 'invitee']
        });
        return InvitationMapper.toDomainArray(dbInvitations);
    }

    async findByHouseId(houseId: number): Promise<DomainInvitation[]> {
        const dbInvitations = await this.invitationRepository.find({
            where: { house: { id: houseId } },
            relations: ['house', 'inviter', 'invitee']
        });
        return InvitationMapper.toDomainArray(dbInvitations);
    }

    async findByStatus(status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED'): Promise<DomainInvitation[]> {
        const dbInvitations = await this.invitationRepository.find({
            where: { status },
            relations: ['house', 'inviter', 'invitee']
        });
        return InvitationMapper.toDomainArray(dbInvitations);
    }

    async findPendingByInviteeEmail(email: string): Promise<DomainInvitation[]> {
        const dbInvitations = await this.invitationRepository.find({
            where: {
                inviteeEmail: email,
                status: 'PENDING'
            },
            relations: ['house', 'inviter', 'invitee']
        });
        return InvitationMapper.toDomainArray(dbInvitations);
    }

    async save(invitation: DomainInvitation): Promise<DomainInvitation> {
        let dbInvitation = InvitationMapper.toDatabase(invitation);

        // Load the related entities
        const house = await this.houseRepository.findOne({ where: { id: invitation.houseId } });
        const inviter = await this.roomieRepository.findOne({ where: { id: invitation.inviterId } });
        const invitee = await this.roomieRepository.findOne({ where: { id: invitation.inviteeId } });

        if (!house || !inviter || !invitee) {
            throw new Error('House, inviter or invitee not found');
        }

        dbInvitation.house = house;
        dbInvitation.inviter = inviter;
        dbInvitation.invitee = invitee;

        const savedDbInvitation = await this.invitationRepository.save(dbInvitation);
        return InvitationMapper.toDomain(savedDbInvitation);
    }

    async delete(id: string): Promise<void> {
        await this.invitationRepository.delete(id);
    }

    async findAll(): Promise<DomainInvitation[]> {
        const dbInvitations = await this.invitationRepository.find({
            relations: ['house', 'inviter', 'invitee']
        });
        return InvitationMapper.toDomainArray(dbInvitations);
    }
}
