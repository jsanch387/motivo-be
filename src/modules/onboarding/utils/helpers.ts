/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';
import {
  SELECT_ONBOARDING_BY_USER,
  SELECT_PROFILE_ONBOARDING_STATUS,
} from '../queries/onboarding.queries';
import { FetchOnboardingDto } from '../dto/fetchOnboardingDto';
import { GetOnboardingResponseDto } from '../dto/getOnboardingResponseDto';
import { BrandKitResponseDto, Tool, Service } from '../dto/brandKitResponseDto';
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
    return { current_step: 1 };
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
    selected_logo_id,
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

  const parseArray = <T>(raw: unknown): T[] => {
    if (!raw) return [];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed as T[];
        }
        return [];
      } catch (e) {
        console.warn('Failed to parse JSON array:', e);
        return [];
      }
    }

    if (Array.isArray(raw)) {
      return raw as T[];
    }

    return [];
  };

  const fullKit: BrandKitResponseDto = {
    ...rawKit,
    brand_colors: rawKit.brand_colors || [],
    user_services: parseArray<Service>(rawKit.user_services),
    suggested_services: parseArray<Service>(rawKit.suggested_services),
    user_tools: parseArray<Tool>(rawKit.user_tools),
    suggested_tools: parseArray<Tool>(rawKit.suggested_tools),
    logo_url: rawKit.logo_url,
  };

  return filterBrandKitByAccess(fullKit);
}

export function normalizeUserTools(tools?: unknown[]): Tool[] {
  return (tools || []).map((tool) => {
    if (
      typeof tool === 'object' &&
      tool !== null &&
      'name' in tool &&
      typeof (tool as any).name === 'string'
    ) {
      return {
        id: (tool as any).id || crypto.randomUUID(),
        name: (tool as any).name,
        checked: (tool as any).checked ?? true,
      };
    }

    return {
      id: crypto.randomUUID(),
      name: String(tool),
      checked: true,
    };
  });
}
