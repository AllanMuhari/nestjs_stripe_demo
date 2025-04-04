// src/payments/entities/payments.entity.ts
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

  @Column({ nullable: true })
  stripePaymentId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'succeeded', 'failed', 'disbursed'],
    default: 'pending',
  })
  status: 'pending' | 'succeeded' | 'failed' | 'disbursed';

  @Column({ default: false })
  isDisbursement: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
