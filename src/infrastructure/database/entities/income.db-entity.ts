import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roomie } from "./roomie.db-entity";
import { House } from "./house.db-entity";

@Entity()
export class Income {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp' })
    earnedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @Column({ default: false })
    isRecurring: boolean;

    @Column({ nullable: true })
    recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

    @Column({ type: 'timestamp', nullable: true })
    nextRecurrenceDate?: Date;

    @ManyToOne(() => Roomie, roomie => roomie.id, { onDelete: 'CASCADE', eager: true })
    earnedBy: Roomie;

    @ManyToOne(() => House, house => house.id, { onDelete: 'CASCADE', eager: true, nullable: true })
    house: House;
}
