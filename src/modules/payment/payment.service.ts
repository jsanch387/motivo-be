// src/modules/payment/payment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class PaymentService {
  constructor(private readonly db: DatabaseService) {}

  async unlockBrandKit(userId: string) {
    const result = await this.db.query(
      `UPDATE brand_kits SET is_paid = true WHERE user_id = $1 RETURNING *`,
      [userId],
    );

    if (!result.length) {
      throw new NotFoundException('Brand kit not found');
    }

    return result[0];
  }
}
