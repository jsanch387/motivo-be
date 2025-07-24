// src/onboarding/dto/product-requcest.dto.ts
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class ProductRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  niche: string;

  @IsString()
  @IsNotEmpty()
  audienceQuestions: string;

  @IsString()
  @IsNotEmpty()
  audiencePlatformsAndSize: string; // New field

  @IsString()
  @IsNotEmpty()
  contentType: string; // New field

  @IsString()
  @IsNotEmpty()
  productIdea: string; // New field
}
