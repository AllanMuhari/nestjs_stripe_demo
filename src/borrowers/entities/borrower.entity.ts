import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from '../../payments/entities/payments.entity';

@Entity()
export class Borrower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: 'Unknown' })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loanAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountOwed: number;

  @Column({ type: 'boolean', default: false })
  isRepaid: boolean;

  @Column({ nullable: true, unique: true })
  stripeCustomerId: string;

  @Column({ nullable: true, unique: true })
  stripeAccountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Payment, (payment) => payment.borrower)
  payments: Payment[];
}
