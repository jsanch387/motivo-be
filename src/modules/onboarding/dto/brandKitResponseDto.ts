// backend/dtos/brandKitResponse.dto.ts

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Tool {
  id: string;
  name: string;
  checked: boolean;
}

export interface BrandKitResponseDto {
  logo_url: string;
  business_name: string;
  slogan: string;
  service_type: string;
  location: string;
  brand_colors: string[];

  user_services: Service[];
  suggested_services: Service[];

  user_tools: Tool[];
  suggested_tools: Tool[];

  is_paid: boolean;
}
