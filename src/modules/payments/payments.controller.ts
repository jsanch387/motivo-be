import {
  Controller,
  Post,
  Req,
  BadRequestException,
  Headers,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithUser } from 'src/common/utils/RequestWithUser';
import { PaymentsService } from './payments.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post('brand-kit/unlock')
  async unlockBrandKit(@Req() req: RequestWithUser) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }

    const result = await this.paymentService.unlockBrandKit(userId);
    return { success: true, brand_kit: result };
  }

  @UseGuards(AuthGuard)
  @Post('/checkout')
  async createCheckoutSession(@Req() req: RequestWithUser) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }

    const session = await this.paymentService.createCheckoutSession(userId);
    return { url: session.url };
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2025-03-31.basil',
    });

    // Validate signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature!,
        webhookSecret,
      );
      console.log(`✅ Stripe webhook received: ${event.type}`);
    } catch (err) {
      console.error(`❌ Webhook signature error: ${(err as Error).message}`);
      throw new HttpException(
        'Invalid Stripe webhook signature',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log(
        '🧾 Stripe session payload:',
        JSON.stringify(session, null, 2),
      );

      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('❌ Missing userId in Stripe metadata');
        throw new BadRequestException('Missing userId in Stripe metadata');
      }

      console.log(`🔓 Unlocking brand kit for user: ${userId}`);
      await this.paymentService.unlockBrandKit(userId);
    }

    return { received: true };
  }
}
