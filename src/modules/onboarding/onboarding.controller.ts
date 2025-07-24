// src/onboarding/onboarding.controller.ts
// ... (imports)
import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { ProductRequestDto } from 'src/features/request-form/dto/product-request.dto';
// ... (other parts of the controller)

@Controller('onboarding')
// Remember to manage AuthGuard if this endpoint is public
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService, // Inject OnboardingService
  ) {}

  // ... (existing methods like saveProgress, fetchOnboarding, etc.)

  @Post('product-request')
  // Add @Public() if you have it and this route is public
  async submitProductRequest(
    @Body() body: ProductRequestDto,
  ): Promise<{ message: string }> {
    console.log(
      '📝 [POST /onboarding/product-request] Incoming product request:',
      body,
    );
    try {
      // ✅ UPDATED CALL: Pass the entire DTO object
      await this.onboardingService.saveProductRequest(body);
      console.log('✅ Product request received successfully from:', body.email);
      return { message: 'Product request received successfully!' };
    } catch (error) {
      console.error('❌ Error processing product request:', error);
      throw new InternalServerErrorException(
        'Failed to process your request. Please try again later.',
      );
    }
  }
}
