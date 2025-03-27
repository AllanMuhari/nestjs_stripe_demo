import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payments.entity';
import { Borrower } from '../borrowers/entities/borrower.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Borrower)
    private readonly borrowerRepository: Repository<Borrower>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2025-02-24.acacia' },
    );
  }
  // payments.service.ts
  async createConnectedAccount(borrowerId: string): Promise<string> {
    const borrower = await this.borrowerRepository.findOne({
      where: { id: borrowerId },
    });
    if (!borrower) {
      throw new HttpException('Borrower not found', HttpStatus.NOT_FOUND);
    }

    // Create Stripe Connect account
    const account = await this.stripe.accounts.create({
      type: 'express',
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Save Stripe account ID to borrower
    borrower.stripeAccountId = account.id;
    await this.borrowerRepository.save(borrower);

    // Create account link for onboarding
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/borrower/onboarding/retry`,
      return_url: `${this.configService.get('FRONTEND_URL')}/borrower/onboarding/success`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  async sendPaymentToBorrower(
    borrowerId: string,
    amount: number,
    currency: string = 'USD',
  ): Promise<any> {
    const borrower = await this.borrowerRepository.findOne({
      where: { id: borrowerId },
      relations: ['payments'],
    });
    if (!borrower) {
      throw new HttpException('Borrower not found', HttpStatus.NOT_FOUND);
    }
    if (!borrower.stripeAccountId) {
      throw new HttpException(
        'Borrower not onboarded to Stripe',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create transfer to borrower's Stripe account
    const transfer = await this.stripe.transfers.create({
      amount: Math.round(amount * 100), // in cents
      currency,
      destination: borrower.stripeAccountId,
    });

    // Record the disbursement in your database
    const payment = this.paymentRepository.create({
      borrower,
      amount,
      currency,
      status: 'disbursed',
      stripePaymentId: transfer.id,
      isDisbursement: true, // You might want to add this field to Payment entity
    });
    await this.paymentRepository.save(payment);

    return transfer;
  }
  /** Create a Payment Intent for a Borrower */
  async createPaymentIntent(
    borrowerId: string, // Change type from number to string
    amount: number,
    currency: string,
  ) {
    try {
      // Check if borrower exists
      const borrower = await this.borrowerRepository.findOne({
        where: { id: borrowerId },
      });
      if (!borrower) {
        throw new HttpException('Borrower not found', HttpStatus.NOT_FOUND);
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata: { borrowerId }, // Pass borrowerId as string
      });

      // Save payment intent in DB (as "pending")
      const payment = this.paymentRepository.create({
        borrower,
        amount,
        currency,
        status: 'pending',
        stripePaymentId: paymentIntent.id,
      });
      await this.paymentRepository.save(payment);

      return { clientSecret: paymentIntent.client_secret, amount, currency };
    } catch (error) {
      console.error('Payment Intent Error:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Handle Stripe Webhook Events */
  async handleWebhook(request: any, signature: string) {
    const endpointSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        Buffer.from(request.body), // Ensure proper buffer parsing
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.error('Webhook error:', err);
      throw new HttpException(
        `Webhook error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(
        `✅ Payment for borrower ${paymentIntent.metadata.borrowerId} succeeded!`,
      );

      // Find and update the payment record
      await this.paymentRepository.update(
        { stripePaymentId: paymentIntent.id },
        { status: 'succeeded' },
      );
    }

    return { received: true };
  }

  /** Get Payments for a Specific Borrower */
  async getPaymentsForBorrower(borrowerId: string) {
    try {
      return await this.paymentRepository.find({
        where: { borrower: { id: borrowerId } }, // Change type to string
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Get Payments Error:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Create a Payment Plan */
  async createPaymentPlan(
    borrowerId: string, // Change type from number to string
    totalAmount: number,
    installments: number,
    dueDates: string[],
  ) {
    if (installments !== dueDates.length) {
      throw new HttpException(
        'Installments count does not match due dates.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      id: Math.floor(Math.random() * 1000),
      borrowerId,
      totalAmount,
      installments,
      amountPerInstallment: totalAmount / installments,
      dueDates,
      status: 'active',
    };
  }

  /** Pay an Installment */
  async payInstallment(
    borrowerId: string, // Change type from number to string
    installmentId: number,
    amount: number,
  ) {
    return {
      message: 'Installment payment successful',
      installmentId,
      amountPaid: amount,
    };
  }
}
