export interface Service {
  name: string;
  price: number;
  source: 'user' | 'ai';
}

export interface BrandTool {
  name: string;
  source: 'user' | 'ai';
  checked: boolean;
}

export interface BrandKitResponseDto {
  logo_url: string;
  business_name: string;
  slogan: string;
  service_type: string;
  location: string;
  brand_colors: string[];
  services: Service[];
  tools: BrandTool[];
  is_paid: boolean;
}
