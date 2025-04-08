import { ApiProperty } from '@nestjs/swagger';

export class CreateBorrowerDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the borrower',
  })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: '123-456-7890', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: 1000, description: 'Initial loan amount' })
  loanAmount: number;
}
