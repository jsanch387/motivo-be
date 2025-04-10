import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingHelperService } from './utils/generate-brand-kit/onboardingHelper.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingHelperService],
})
export class OnboardingModule {}
