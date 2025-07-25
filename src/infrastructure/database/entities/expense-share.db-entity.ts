import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, Check
} from 'typeorm';
import { Expense } from './expense.db-entity';
import { Roomie } from './roomie.db-entity';

@Entity()
@Check('"shareAmount" >= 0')
export class ExpenseShare {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    expenseId: number;

    @Column()
    roomieId: number;

    @Column('decimal', { precision: 12, scale: 2 })
    shareAmount: number;

    /* relaciones */
    @ManyToOne(() => Expense, e => e.shares, { onDelete: 'CASCADE' })
    expense: Expense;

    @ManyToOne(() => Roomie, r => r.shares, { onDelete: 'CASCADE' })
    roomie: Roomie;
}
