import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roomie } from "./roomie.db-entity";
import { House } from "./house.db-entity";
import { ExpenseShare } from "./expense-share.db-entity";

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    description?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @ManyToOne(() => Roomie, roomie => roomie.id, { onDelete: 'CASCADE', eager: true })
    paidBy: Roomie;

    @ManyToOne(() => House, house => house.id, { onDelete: 'CASCADE', eager: true, nullable: true })
    house: House;

    @OneToMany(() => ExpenseShare, share => share.expense, { eager: true })
    shares: ExpenseShare[];

}