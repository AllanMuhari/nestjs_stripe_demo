import { Controller, Get, Post, Body } from '@nestjs/common';
import { BorrowersService } from './borrowers.service';

@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Post()
  async createBorrower(@Body() body) {
    return this.borrowersService.createBorrower(
      body.name,
      body.email,
      body.phone,
    );
  }

  @Get()
  async getAllBorrowers() {
    return this.borrowersService.getBorrowers();
  }
}
