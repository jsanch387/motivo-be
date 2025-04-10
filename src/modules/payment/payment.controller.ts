// src/modules/payment/payment.controller.ts
import {
  Controller,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithUser } from 'src/common/utils/RequestWithUser';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('brand-kit')
  async unlockBrandKit(@Req() req: RequestWithUser) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }

    const result = await this.paymentService.unlockBrandKit(userId);
    return { success: true, brand_kit: result };
  }
}
