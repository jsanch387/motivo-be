/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';
import {
  SELECT_ONBOARDING_BY_USER,
  SELECT_PROFILE_ONBOARDING_STATUS,
} from '../queries/onboarding.queries';
import { FetchOnboardingDto } from '../dto/fetchOnboardingDto';
import { GetOnboardingResponseDto } from '../dto/getOnboardingResponseDto';
import {
  BrandKitResponseDto,
  BrandTool,
  Service,
} from '../dto/brandKitResponseDto';
import { filterBrandKitByAccess } from './brand-kit.utils';

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
    readiness_level, // ✅ changed from user_tools
    business_name_suggestions,
    selected_business_name,
    brand_color_options,
    selected_color_palette,
    logo_style_options,
    selected_logo_style,
    selected_logo_id,
    services,
    tools,
    slogan,
  } = result[0];

  return {
    current_step,
    service_type,
    location,
    readiness_level, // ✅ changed from user_tools
    business_name_suggestions,
    selected_business_name,
    brand_color_options,
    selected_color_palette,
    logo_style_options,
    selected_logo_style,
    selected_logo_id,
    services,
    tools,
    slogan,
  };
}

export async function fetchBrandKitByUserId(
  db: DatabaseService,
  userId: string,
): Promise<BrandKitResponseDto> {
  const result = await db.query<BrandKitResponseDto>(
    `SELECT * FROM brand_kits WHERE user_id = $1 LIMIT 1`,
    [userId],
  );

  if (!result.length) {
    throw new NotFoundException('Brand kit not found');
  }

  const rawKit = result[0];

  // ✅ Parse services
  const parsedServices: Service[] = JSON.parse(
    JSON.stringify(rawKit.services || []),
  );

  // ✅ Parse tools safely
  const parsedTools: BrandTool[] = (rawKit.tools || []).map((tool: any) => {
    if (typeof tool.name === 'object') {
      return {
        name: tool.name.name,
        source: tool.name.source,
        checked: tool.name.checked,
      };
    }
    return {
      name: tool.name,
      source: tool.source || 'user',
      checked: tool.checked ?? false,
    };
  });

  const fullKit: BrandKitResponseDto = {
    ...rawKit,
    brand_colors: rawKit.brand_colors || [],
    services: parsedServices,
    tools: parsedTools,
    logo_url: rawKit.logo_url,
  };

  return filterBrandKitByAccess(fullKit);
}

export function normalizeUserTools(tools?: unknown[]): BrandTool[] {
  return (tools || []).map((tool) => {
    // If it's already a valid object, pass through
    if (
      typeof tool === 'object' &&
      tool !== null &&
      'name' in tool &&
      typeof (tool as any).name === 'string'
    ) {
      return {
        name: (tool as any).name,
        source: (tool as any).source ?? 'user',
        checked: (tool as any).checked ?? true,
      };
    }

    // Otherwise, assume it's a string and wrap
    return {
      name: String(tool),
      source: 'user',
      checked: true,
    };
  });
}
