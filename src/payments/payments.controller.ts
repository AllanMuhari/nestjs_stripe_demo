import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  async createPayment(@Body() body) {
    return this.paymentsService.createPaymentIntent(body.loanId, body.amount);
  }

  @Get('confirm/:stripePaymentId')
  async confirmPayment(@Param('stripePaymentId') stripePaymentId: string) {
    return this.paymentsService.confirmPayment(stripePaymentId);
  }
}
