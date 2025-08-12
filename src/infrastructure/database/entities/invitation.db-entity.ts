import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Roomie } from "./roomie.db-entity";
import { House } from "./house.db-entity";

@Entity()
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => House, { eager: true })
    house: House;

    @ManyToOne(() => Roomie, { eager: true })
    inviter: Roomie;

    @ManyToOne(() => Roomie, { eager: true })
    invitee: Roomie;

    @Column()
    inviterEmail: string;

    @Column({ type: 'enum', enum: ['PENDING', 'ACCEPTED', 'CANCELED', 'DECLINED'], default: 'PENDING' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    acceptedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    declinedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    canceledAt?: Date;
}