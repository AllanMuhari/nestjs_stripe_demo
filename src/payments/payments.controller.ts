import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  // payments.controller.ts
  @Post('onboard')
  async onboardBorrowerToStripe(@Body() body: { borrowerId: string }) {
    return this.paymentsService.createConnectedAccount(body.borrowerId);
  }

  @Post('disburse')
  async disburseFunds(
    @Body() body: { borrowerId: string; amount: number; currency?: string },
  ) {
    return this.paymentsService.sendPaymentToBorrower(
      body.borrowerId,
      body.amount,
      body.currency,
    );
  }
  @Post('intent')
  async createPaymentIntent(
    @Body() body: { borrowerId: string; amount: number; currency: string },
  ) {
    return this.paymentsService.createPaymentIntent(
      body.borrowerId,
      body.amount,
      body.currency,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Req() request: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(request, signature);
  }

  @Get('borrower/:id')
  async getPayments(@Param('id') borrowerId: string) {
    return this.paymentsService.getPaymentsForBorrower(borrowerId);
  }

  @Post('plan')
  async createPaymentPlan(
    @Body()
    body: {
      borrowerId: string;
      totalAmount: number;
      installments: number;
      dueDates: string[];
    },
  ) {
    return this.paymentsService.createPaymentPlan(
      body.borrowerId,
      body.totalAmount,
      body.installments,
      body.dueDates,
    );
  }

  @Post('installment')
  async payInstallment(
    @Body() body: { borrowerId: string; installmentId: number; amount: number },
  ) {
    return this.paymentsService.payInstallment(
      body.borrowerId,
      body.installmentId,
      body.amount,
    );
  }
}
