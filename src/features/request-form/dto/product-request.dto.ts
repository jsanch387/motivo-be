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
}
