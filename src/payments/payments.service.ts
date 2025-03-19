import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

    if (!stripeKey) {
      throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
    }
  }

  async createPaymentIntent(amount: number, currency: string) {
    return this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types : ['card'],
    });
  }
}
