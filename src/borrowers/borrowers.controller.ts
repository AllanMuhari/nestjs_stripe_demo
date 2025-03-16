import { Controller, Get, Param } from '@nestjs/common';
import { BorrowersService } from './borrowers.service';

@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Get()
  getAllBorrowers() {
    return this.borrowersService.getAllBorrowers();
  }

  @Get(':id')
  getBorrower(@Param('id') id: number) {
    return this.borrowersService.getBorrowerById(Number(id));
  }
}
