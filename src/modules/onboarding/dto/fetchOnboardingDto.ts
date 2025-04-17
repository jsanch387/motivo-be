export interface FetchOnboardingDto {
  current_step: number;
  service_type: string;
  location: string;
  readiness_level: string;
  business_name_suggestions: string[];
  selected_business_name: string;
  brand_color_options: string[][];
  selected_color_palette: string[];
  logo_style_options: string[];
  selected_logo_style: string;
  selected_logo_url: string;
  services: { name: string; price: number }[];
  tools: string[];
  slogan: string;
}
