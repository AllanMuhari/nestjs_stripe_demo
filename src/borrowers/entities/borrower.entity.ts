import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from '../../payments/entities/payments.entity';

@Entity()
export class Borrower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loanAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountOwed: number;

  @Column({ type: 'boolean', default: false })
  isRepaid: boolean;

  @OneToMany(() => Payment, (payment) => payment.borrower)
  payments: Payment[]; // Establishes a one-to-many relationship with payments
}
