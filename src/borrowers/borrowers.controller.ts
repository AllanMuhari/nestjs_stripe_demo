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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateBorrowerDto } from './dto/create-borrower.dto';

@ApiTags('Borrowers')
@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @ApiOperation({ summary: 'Create a new borrower' })
  @ApiResponse({
    status: 201,
    description: 'Borrower successfully created',
    type: Borrower,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiBody({ type: CreateBorrowerDto })
  @Post()
  async create(
    @Body() createBorrowerDto: CreateBorrowerDto,
  ): Promise<Borrower> {
    return this.borrowersService.create(createBorrowerDto);
  }

  @ApiOperation({ summary: 'Get all borrowers' })
  @ApiResponse({
    status: 200,
    description: 'List of all borrowers',
    type: [Borrower],
  })
  @Get()
  async getAll(): Promise<Borrower[]> {
    return this.borrowersService.findAll();
  }

  @ApiOperation({ summary: 'Get a specific borrower' })
  @ApiResponse({
    status: 200,
    description: 'The requested borrower',
    type: Borrower,
  })
  @ApiResponse({
    status: 404,
    description: 'Borrower not found',
  })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Borrower | null> {
    return this.borrowersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a borrower' })
  @ApiResponse({
    status: 200,
    description: 'The updated borrower',
    type: Borrower,
  })
  @ApiResponse({
    status: 404,
    description: 'Borrower not found',
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBorrowerDto: CreateBorrowerDto, 
  ): Promise<Borrower> {
    return this.borrowersService.update(id, updateBorrowerDto);
  }

  @ApiOperation({ summary: 'Delete a borrower' })
  @ApiResponse({
    status: 200,
    description: 'Borrower successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Borrower not found',
  })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.borrowersService.delete(id);
  }
}
