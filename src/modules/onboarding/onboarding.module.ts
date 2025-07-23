import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingHelperService } from './utils/generate-brand-kit/onboardingHelper.service';
import { RequestFormDbService } from 'src/features/request-form/request-form-db.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingHelperService, RequestFormDbService],
})
export class OnboardingModule {}
