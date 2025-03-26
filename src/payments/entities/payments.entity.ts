import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Borrower } from '../../borrowers/entities/borrower.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Borrower, (borrower) => borrower.payments, {
    onDelete: 'CASCADE',
  })
  borrower: Borrower;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'succeeded' | 'failed'; // Explicit enum type

  @Column({ nullable: true })
  stripePaymentId: string; // Store Stripe payment ID for reference

  @CreateDateColumn()
  createdAt: Date;
}
