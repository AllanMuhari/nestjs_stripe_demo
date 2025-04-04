import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BorrowersService } from './borrowers.service';
import { Borrower } from './entities/borrower.entity';

@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Get()
  async getAll(): Promise<Borrower[]> {
    return this.borrowersService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Borrower | null> {
    return this.borrowersService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Borrower>): Promise<Borrower> {
    return this.borrowersService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Borrower>,
  ): Promise<Borrower> {
    return this.borrowersService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.borrowersService.delete(id);
  }
}
