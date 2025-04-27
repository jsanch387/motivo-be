// src/modules/payment/payment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly db: DatabaseService) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-03-31.basil',
    });
  }
  async createCheckoutSession(userId: string) {
    const userIdStr = String(userId);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_BRAND_KIT_PRICE_ID, // ✅ use real Price ID
          quantity: 1,
        },
      ],
      metadata: {
        userId: userIdStr,
      },
      client_reference_id: userIdStr,
      success_url: `${process.env.FRONTEND_URL}/dashboard/brand-kit`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/cancel`,
    });

    return { url: session.url };
  }

  async unlockBrandKit(userId: string) {
    const result = await this.db.query(
      'UPDATE brand_kits SET is_paid = true WHERE user_id = $1 RETURNING *',
      [userId],
    );

    if (!result.length) {
      throw new NotFoundException('Brand kit not found');
    }

    return result[0];
  }
}
