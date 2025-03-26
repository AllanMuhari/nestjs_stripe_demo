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
