import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Roomie } from "./roomie.db-entity";
import { House } from "./house.db-entity";

@Entity('roomie_house')
@Index(['roomieId', 'houseId'], { unique: true })
export class RoomieHouse {
    @Column('decimal', { nullable: true, precision: 5, scale: 2 })
    payRatio?: number;

    @PrimaryColumn()
    roomieId: number;

    @PrimaryColumn()
    houseId: number;

    @ManyToOne(() => Roomie, roomie => roomie.memberships, { onDelete: 'CASCADE' })
    roomie: Roomie;

    @ManyToOne(() => House, house => house.memberships, { onDelete: 'CASCADE' })
    house: House;
}
