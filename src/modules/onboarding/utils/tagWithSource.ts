import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';
import {
  SELECT_ONBOARDING_BY_USER,
  SELECT_PROFILE_ONBOARDING_STATUS,
} from '../queries/onboarding.queries';
import { FetchOnboardingDto } from '../dto/fetchOnboardingDto';
import { GetOnboardingResponseDto } from '../dto/getOnboardingResponseDto';
import { ServiceInput, ToolInput } from '../dto/save-onboarding.dto';

// 🔍 Get status from profile table only (source of truth)
export async function fetchProfileStatus(
  db: DatabaseService,
  userId: string,
): Promise<'not_started' | 'in_progress' | 'completed'> {
  const result = await db.query<{ onboarding_status: string }>(
    SELECT_PROFILE_ONBOARDING_STATUS,
    [userId],
  );

  if (!result.length) {
    throw new NotFoundException('User profile not found');
  }

  return result[0].onboarding_status as
    | 'not_started'
    | 'in_progress'
    | 'completed';
}

// 📦 Get onboarding row by user
export async function fetchOnboardingProgress(
  db: DatabaseService,
  userId: string,
): Promise<Omit<GetOnboardingResponseDto, 'brand_kit_status'>> {
  const result = await db.query<FetchOnboardingDto>(SELECT_ONBOARDING_BY_USER, [
    userId,
  ]);

  if (!result.length) {
    return {
      current_step: 1,
    };
  }

  const {
    current_step,
    service_type,
    location,
    readiness_level,
    business_name_suggestions,
    selected_business_name,
    brand_color_options,
    selected_color_palette,
    logo_style_options,
    selected_logo_style,
    selected_logo_url,
    services,
    tools,
    slogan,
  } = result[0];

  return {
    current_step,
    service_type,
    location,
    readiness_level,
    business_name_suggestions,
    selected_business_name,
    brand_color_options,
    selected_color_palette,
    logo_style_options,
    selected_logo_style,
    selected_logo_url,
    services,
    tools,
    slogan,
  };
}

// 🧢 Get brand kit and hide parts if not paid
// export async function fetchBrandKitByUserId(
//   db: DatabaseService,
//   userId: string,
// ): Promise<BrandKitResponseDto> {
//   const result = await db.query<BrandKitResponseDto>(
//     `SELECT * FROM brand_kits WHERE user_id = $1 LIMIT 1`,
//     [userId],
//   );

//   if (!result.length) {
//     throw new NotFoundException('Brand kit not found');
//   }

//   const kit = result[0];

//   if (!kit.is_paid) {
//     return {
//       ...kit,
//       brand_colors: kit.brand_colors.slice(0, 1),
//       services: kit.services.slice(0, 2),
//       tools: kit.tools.slice(0, 2),
//       logo_url: '', // Hide actual logo URL
//     };
//   }

//   return kit;
// }

// 🏷️ Tag all incoming services with `source: 'user'` if not already tagged
export function tagServicesWithSource(
  services?: ServiceInput[],
): ServiceInput[] {
  return (services || []).map((service) => ({
    ...service,
    source: service.source || 'user',
  }));
}

// 🏷️ Tag all incoming tools with `source: 'user'` if not already tagged
export function tagToolsWithSource(
  tools?: (string | Partial<ToolInput>)[],
): ToolInput[] {
  return (tools || []).map((tool) => {
    if (typeof tool === 'string') {
      return {
        name: tool,
        checked: true,
        source: 'user',
      };
    }

    return {
      name: tool.name || '',
      checked: tool.checked ?? true,
      source: tool.source || 'user',
    };
  });
}
