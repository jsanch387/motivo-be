/* eslint-disable @typescript-eslint/no-explicit-any */
// src/onboarding/onboarding.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common'; // Make sure Injectable is imported, and InternalServerErrorException if you want consistent error handling
import { ProductRequestDto } from 'src/features/request-form/dto/product-request.dto';
import { RequestFormDbService } from 'src/features/request-form/request-form-db.service';

@Injectable() // Mark this class as an injectable service
export class OnboardingService {
  constructor(private readonly db: RequestFormDbService) {} // Inject DatabaseService

  async saveProductRequest(
    payload: ProductRequestDto, // ✅ UPDATED: Accept the entire DTO object
  ): Promise<any> {
    // Adjust return type as needed
    console.log('💾 Saving product request via OnboardingService...');
    try {
      // ✅ CORRECT CALL: Pass the entire DTO object to the DB service
      const savedRequest = await this.db.createProductRequest(payload);
      console.log('✅ Product request saved successfully:', savedRequest);
      return savedRequest;
    } catch (error) {
      console.error(
        '❌ Error saving product request in OnboardingService:',
        error,
      );
      // It's good practice to re-throw a NestJS HTTP exception
      throw new InternalServerErrorException('Failed to save product request');
    }
  }
}
