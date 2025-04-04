import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrower } from './entities/borrower.entity';

@Injectable()
export class BorrowersService {
  constructor(
    @InjectRepository(Borrower)
    private borrowerRepo: Repository<Borrower>,
  ) {}

  async findAll(): Promise<Borrower[]> {
    return this.borrowerRepo.find();
  }

  async findOne(id: string): Promise<Borrower | null> {
    return this.borrowerRepo.findOne({ where: { id } });
  }

  async create(data: Partial<Borrower>): Promise<Borrower> {
    const borrower = this.borrowerRepo.create(data);
    return this.borrowerRepo.save(borrower);
  }

  async update(id: string, data: Partial<Borrower>): Promise<Borrower> {
    await this.borrowerRepo.update(id, data);
    const borrower = await this.findOne(id);
    if (!borrower) {
      throw new Error(`Borrower with ID ${id} not found`);
    }
    return borrower;
  }

  async delete(id: string): Promise<void> {
    await this.borrowerRepo.delete(id);
  }
}
