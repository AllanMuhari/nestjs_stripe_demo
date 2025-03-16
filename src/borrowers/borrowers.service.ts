import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrower } from './entities/borrower.entity';

@Injectable()
export class BorrowersService {
  constructor(
    @InjectRepository(Borrower)
    private borrowerRepository: Repository<Borrower>,
  ) {}

  async getAllBorrowers() {
    return this.borrowerRepository.find();
  }

  async getBorrowerById(id: number) {
    return this.borrowerRepository.findOne({ where: { id } });
  }
}
