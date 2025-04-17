import {
  BrandKitResponseDto,
  Service,
  Tool,
} from '../../dto/brandKitResponseDto';
import { GetOnboardingResponseDto } from '../../dto/getOnboardingResponseDto';

type BuildBrandKitInput = {
  onboarding: GetOnboardingResponseDto;
  userServices: Service[];
  userTools: Tool[];
  suggestedServices: Service[];
  suggestedTools: Tool[];
};

export function buildBrandKit({
  onboarding,
  userServices,
  userTools,
  suggestedServices,
  suggestedTools,
}: BuildBrandKitInput): BrandKitResponseDto {
  console.log(
    '🧠 Logo URL pulled for brand kit:',
    onboarding.selected_logo_url,
  );

  return {
    // ✅ Pull the permanent Supabase URL stored in onboarding
    logo_url: onboarding.selected_logo_url || '',

    business_name: onboarding.selected_business_name || 'My Business',
    slogan: onboarding.slogan || 'Your go-to local service!',
    brand_colors: onboarding.selected_color_palette || [],
    service_type: onboarding.service_type || '',
    location: onboarding.location || '',
    is_paid: false,

    user_services: [...userServices],
    suggested_services: [...suggestedServices],
    user_tools: [...userTools],
    suggested_tools: [...suggestedTools],
  };
}
