import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, CreateDateColumn, Check,
    DeleteDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { Roomie } from './roomie.db-entity';
import { House } from './house.db-entity';

@Entity()
@Check('"amount" > 0')
export class Settlement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fromRoomieId: number;

    @Column()
    toRoomieId: number;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ nullable: true })
    description?: string;

    @Column()
    houseId: number;

    @CreateDateColumn()
    createdAt: Date;

    /* Relaciones */
    @ManyToOne(() => Roomie, roomie => roomie.id, { onDelete: 'CASCADE' })
    fromRoomie: Roomie;

    @ManyToOne(() => Roomie, roomie => roomie.id, { onDelete: 'CASCADE' })
    toRoomie: Roomie;

    @ManyToOne(() => House, house => house.id, { onDelete: 'CASCADE' })
    house: House;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
