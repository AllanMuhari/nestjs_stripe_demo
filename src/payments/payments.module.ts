import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payments.entity';
import { Borrower } from '../borrowers/entities/borrower.entity';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, Borrower]),
  ],
  controllers:[PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
