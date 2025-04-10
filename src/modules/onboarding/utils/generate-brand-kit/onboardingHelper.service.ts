// src/features/brandKit/helpers/fetchOnboardingData.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';
import { GetOnboardingResponseDto } from '../../dto/getOnboardingResponseDto';
import { SELECT_ONBOARDING_BY_USER } from '../../queries/onboarding.queries';
import { BrandKitResponseDto } from '../../dto/brandKitResponseDto';

@Injectable()
export class OnboardingHelperService {
  constructor(private readonly db: DatabaseService) {}

  async fetchOnboardingData(userId: string): Promise<GetOnboardingResponseDto> {
    const rows = await this.db.query<GetOnboardingResponseDto>(
      SELECT_ONBOARDING_BY_USER,
      [userId],
    );

    if (!rows.length) {
      console.warn('❌ No onboarding data found for user:', userId);
      throw new NotFoundException('Onboarding data not found');
    }

    return rows[0];
  }

  async saveBrandKitToDB(
    userId: string,
    kit: BrandKitResponseDto,
  ): Promise<void> {
    const query = `
      INSERT INTO brand_kits (
        user_id,
        logo_url,
        business_name,
        slogan,
        service_type,
        location,
        brand_colors,
        user_services,
        suggested_services,
        user_tools,
        suggested_tools,
        is_paid
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        business_name = EXCLUDED.business_name,
        slogan = EXCLUDED.slogan,
        service_type = EXCLUDED.service_type,
        location = EXCLUDED.location,
        brand_colors = EXCLUDED.brand_colors,
        user_services = EXCLUDED.user_services,
        suggested_services = EXCLUDED.suggested_services,
        user_tools = EXCLUDED.user_tools,
        suggested_tools = EXCLUDED.suggested_tools,
        is_paid = EXCLUDED.is_paid
    `;

    const values = [
      userId,
      kit.logo_url,
      kit.business_name,
      kit.slogan,
      kit.service_type,
      kit.location,
      JSON.stringify(kit.brand_colors),
      JSON.stringify(kit.user_services),
      JSON.stringify(kit.suggested_services),
      JSON.stringify(kit.user_tools),
      JSON.stringify(kit.suggested_tools),
      kit.is_paid,
    ];

    await this.db.query(query, values);
  }
}
