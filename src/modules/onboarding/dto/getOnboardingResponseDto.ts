// src/modules/onboarding/dto/getOnboardingResponseDto.ts

import { BrandKitResponseDto } from './brandKitResponseDto';

export interface GetOnboardingResponseDto {
  brand_kit_status: 'not_started' | 'in_progress' | 'completed';
  current_step?: number;

  // Returned during "in_progress"
  service_type?: string;
  location?: string;
  readiness_level?: string;
  business_name_suggestions?: string[];
  selected_business_name?: string;
  brand_color_options?: string[][];
  selected_color_palette?: string[];
  logo_style_options?: string[];
  selected_logo_style?: string;
  selected_logo_url?: string;
  services?: { name: string; price: number }[];
  tools?: string[];
  slogan?: string;

  // ✅ Returned when status is "completed"
  brand_kit?: BrandKitResponseDto;
  flyer_url?: string | null; // ✅ optional flyer image
}
