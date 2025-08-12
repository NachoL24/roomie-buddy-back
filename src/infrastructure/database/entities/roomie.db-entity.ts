import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    Unique
} from 'typeorm';
import { RoomieHouse } from './roomie-house.db-entity';
import { ExpenseShare } from './expense-share.db-entity';
import { Expense } from './expense.db-entity';
import { Invitation } from './invitation.db-entity';
// import { RoomieHouse } from './roomie-house.entity';
// import { Expense } from './expense.entity';
// import { ExpenseShare } from './expense-share.entity';

@Entity()
export class Roomie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    auth0Sub: string;

    @Column()
    surname: string;

    @Column({ nullable: true, unique: true })
    document?: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    picture?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @OneToMany(() => RoomieHouse, rh => rh.roomie)
    memberships: RoomieHouse[];

    @OneToMany(() => Expense, e => e.paidBy)
    paidExpenses: Expense[];

    @OneToMany(() => ExpenseShare, es => es.roomie)
    shares: ExpenseShare[];

    @OneToMany(() => Invitation, i => i.inviter)
    sentInvitations: Invitation[];

    @OneToMany(() => Invitation, i => i.invitee)
    receivedInvitations: Invitation[];
}
