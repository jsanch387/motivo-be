export type ServiceInput = {
  name: string;
  price: number;
  source?: 'user' | 'ai';
};

export type ToolInput = {
  name: string;
  checked: boolean;
  source?: 'user' | 'ai';
};

export class SaveOnboardingDto {
  current_step: number;

  service_type?: string;
  location?: string;
  readiness_level?: string; // ✅ New field replacing user_tools

  business_name_suggestions?: string[];
  selected_business_name?: string;

  brand_color_options?: string[][];
  selected_color_palette?: string[];

  logo_style_options?: string[];
  selected_logo_style?: string;
  selected_logo_url?: string;

  services?: ServiceInput[];
  tools?: ToolInput[];

  slogan?: string;
}
