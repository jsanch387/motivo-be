/* eslint-disable @typescript-eslint/no-explicit-any */
// src/onboarding/onboarding.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common'; // Make sure Injectable is imported, and InternalServerErrorException if you want consistent error handling
import { RequestFormDbService } from 'src/features/request-form/request-form-db.service';

@Injectable() // Mark this class as an injectable service
export class OnboardingService {
  constructor(private readonly db: RequestFormDbService) {} // Inject DatabaseService

  async saveProductRequest(
    email: string,
    niche: string,
    audienceQuestions: string,
  ): Promise<any> {
    console.log('💾 Saving product request via OnboardingService...');
    try {
      // ✅ CORRECT CALL: Using the specific method you added to DatabaseService
      const savedRequest = await this.db.createProductRequest(
        email,
        niche,
        audienceQuestions,
      );
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
