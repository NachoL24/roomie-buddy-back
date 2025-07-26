import { Invitation } from '../entities/invitation.entity';

export interface InvitationRepository {
    findById(id: string): Promise<Invitation | null>;
    findByInviteeEmail(email: string): Promise<Invitation[]>;
    findByInviterId(inviterId: number): Promise<Invitation[]>;
    findByHouseId(houseId: number): Promise<Invitation[]>;
    findByStatus(status: 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'DECLINED'): Promise<Invitation[]>;
    findPendingByInviteeEmail(email: string): Promise<Invitation[]>;
    save(invitation: Invitation): Promise<Invitation>;
    delete(id: string): Promise<void>;
    findAll(): Promise<Invitation[]>;
}
