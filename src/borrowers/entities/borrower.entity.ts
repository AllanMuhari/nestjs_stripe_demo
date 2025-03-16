import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Borrower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loanAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountOwed: number;

  @Column({ type: 'boolean', default: false })
  isRepaid: boolean;
}
