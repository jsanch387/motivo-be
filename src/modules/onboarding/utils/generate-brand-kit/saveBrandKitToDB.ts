// src/features/brandKit/helpers/saveBrandKitToDB.ts
import { DatabaseService } from 'src/common/database/database.service';
import { BrandKitResponseDto } from '../../dto/brandKitResponseDto';

export async function saveBrandKitToDB(
  userId: string,
  brandKit: BrandKitResponseDto,
  db: DatabaseService,
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
    brandKit.logo_url,
    brandKit.business_name,
    brandKit.slogan,
    brandKit.service_type,
    brandKit.location,
    JSON.stringify(brandKit.brand_colors),
    JSON.stringify(brandKit.user_services),
    JSON.stringify(brandKit.suggested_services),
    JSON.stringify(brandKit.user_tools),
    JSON.stringify(brandKit.suggested_tools),
    brandKit.is_paid,
  ];

  await db.query(query, values);
}
