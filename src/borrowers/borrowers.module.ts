import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrower } from './entities/borrower.entity';
import { BorrowersService } from './borrowers.service';
import { BorrowersController } from './borrowers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Borrower])],
  providers: [BorrowersService],
  controllers: [BorrowersController],
})
export class BorrowersModule {}
