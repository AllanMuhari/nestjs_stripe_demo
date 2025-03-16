import { Controller, Post, Body, Headers, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private readonly paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!stripeKey) {
      throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
    }
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET in environment variables');
    }

    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
    this.webhookSecret = webhookSecret;
  }

  // Create a payment intent for borrowers
  @Post('create-intent')
  async createPaymentIntent(@Body('amount') amount: number) {
    return this.paymentsService.createPaymentIntent(amount, 'usd');
  }

  // Stripe webhook handler
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        this.webhookSecret,
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      console.log('💰 Payment succeeded:', event.data.object);
    }

    res.sendStatus(200);
  }
}
