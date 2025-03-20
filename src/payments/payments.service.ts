import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private supabase: SupabaseClient;
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_ANON_KEY') || '',
    );

    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  async createPaymentIntent(loanId: string, amount: number) {
    // 1. Create a Stripe Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // 2. Store payment in Supabase
    const { data, error } = await this.supabase
      .from('payments')
      .insert([
        {
          loan_id: loanId,
          stripe_payment_id: paymentIntent.id,
          amount,
          status: 'pending',
        },
      ])
      .select();

    if (error) throw error;

    return { paymentIntent, paymentData: data };
  }

  async confirmPayment(stripePaymentId: string) {
    // 1. Retrieve payment from Stripe
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(stripePaymentId);

    // 2. Update payment status in Supabase
    const status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';

    const { error } = await this.supabase
      .from('payments')
      .update({ status })
      .eq('stripe_payment_id', stripePaymentId);

    if (error) throw error;

    return { paymentIntent, status };
  }
}
