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
      { 
        apiVersion: '2025-02-24.acacia',
        typescript: true,
      },
    );
  }

  async createConnectedAccount(borrowerId: string): Promise<string> {
    const borrower = await this.borrowerRepository.findOne({
      where: { id: borrowerId },
    });
    
    if (!borrower) {
      throw new HttpException('Borrower not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Create Stripe Connect Express account
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US', // Specify country code
        email: borrower.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: borrower.name?.split(' ')[0],
          last_name: borrower.name?.split(' ')[1] || '',
          email: borrower.email,
        },
      });

      // Save Stripe account ID to borrower
      borrower.stripeAccountId = account.id;
      await this.borrowerRepository.save(borrower);

      // Create onboarding link
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${this.configService.get('FRONTEND_URL')}/onboarding/retry`,
        return_url: `${this.configService.get('FRONTEND_URL')}/onboarding/success`,
        type: 'account_onboarding',
        collect: 'eventually_due', // Collect all required fields upfront
      });

      return accountLink.url;
    } catch (error) {
      console.error('Stripe Connect Error:', error);
      throw new HttpException(
        `Failed to create Stripe account: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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

    try {
      // Verify the account is ready for transfers
      const account = await this.stripe.accounts.retrieve(borrower.stripeAccountId);
      if (!account.capabilities?.transfers || account.capabilities.transfers !== 'active') {
        throw new HttpException(
          'Borrower account not ready for transfers',
          HttpStatus.BAD_REQUEST
        );
      }

      // Create transfer to borrower's Stripe account
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // in cents
        currency,
        destination: borrower.stripeAccountId,
        metadata: {
          borrowerId,
          purpose: 'loan_disbursement',
        },
      });

      // Record the disbursement in your database
      const payment = this.paymentRepository.create({
        borrower,
        amount,
        currency,
        status: 'disbursed',
        stripePaymentId: transfer.id,
        isDisbursement: true,
      });
      
      await this.paymentRepository.save(payment);

      return transfer;
    } catch (error) {
      console.error('Transfer Error:', error);
      throw new HttpException(
        `Failed to transfer funds: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** Create a Payment Intent for a Borrower */
  async createPaymentIntent(
    borrowerId: string,
    amount: number,
    currency: string,
  ) {
    try {
      const borrower = await this.borrowerRepository.findOne({
        where: { id: borrowerId },
      });
      
      if (!borrower) {
        throw new HttpException('Borrower not found', HttpStatus.NOT_FOUND);
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata: { borrowerId },
        payment_method_types: ['card'],
      });

      const payment = this.paymentRepository.create({
        borrower,
        amount,
        currency,
        status: 'pending',
        stripePaymentId: paymentIntent.id,
      });
      
      await this.paymentRepository.save(payment);

      return { 
        clientSecret: paymentIntent.client_secret, 
        amount, 
        currency,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Payment Intent Error:', error);
      throw new HttpException(
        error.message, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** Handle Stripe Webhook Events */
  async handleWebhook(request: any, signature: string) {
    const endpointSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request.rawBody || request.body,
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

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.paymentRepository.update(
          { stripePaymentId: paymentIntent.id },
          { status: 'succeeded' },
        );
        break;

      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        // You might want to update borrower's Stripe account status here
        break;

      case 'transfer.created':
      case 'transfer.updated':
        const transfer = event.data.object as Stripe.Transfer;
        // Update your payment records accordingly
        break;
    }

    return { received: true };
  }

  /** Get Payments for a Specific Borrower */
  async getPaymentsForBorrower(borrowerId: string) {
    try {
      return await this.paymentRepository.find({
        where: { borrower: { id: borrowerId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Get Payments Error:', error);
      throw new HttpException(
        error.message, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** Create a Payment Plan */
  async createPaymentPlan(
    borrowerId: string,
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
    borrowerId: string,
    installmentId: number,
    amount: number,
  ) {
    try {
      // In a real implementation, you would create a payment intent here
      return {
        message: 'Installment payment successful',
        installmentId,
        amountPaid: amount,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}