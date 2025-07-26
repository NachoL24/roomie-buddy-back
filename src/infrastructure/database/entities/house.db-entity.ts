import { Invitation } from './invitation.db-entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoomieHouse } from "./roomie-house.db-entity";

@Entity()
export class House {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @OneToMany(() => RoomieHouse, rh => rh.house)
    memberships: RoomieHouse[];
    
    @OneToMany(() => Invitation, i => i.house)
    invitations: Invitation[];

}