import { Injectable, NotFoundException } from '@nestjs/common';
import { DashboardResponse, OnboardingStatus } from './types/dashboard.types';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboard(userId: string): Promise<DashboardResponse> {
    const profile = await this.db.query<{ onboarding_status: string }>(
      'SELECT onboarding_status FROM profiles WHERE user_id = $1 LIMIT 1',
      [userId],
    );

    if (!profile.length) {
      throw new NotFoundException('User profile not found');
    }

    const onboardingStatus = profile[0].onboarding_status as OnboardingStatus;

    // Case 1: not_started
    if (onboardingStatus === 'not_started') {
      return { onboardingStatus: 'not_started' };
    }

    // Case 2: in_progress
    if (onboardingStatus === 'in_progress') {
      const onboarding = await this.db.query<{ current_step: number }>(
        'SELECT current_step FROM onboarding WHERE user_id = $1 LIMIT 1',
        [userId],
      );

      const currentStep = onboarding[0]?.current_step ?? 1;

      return {
        onboardingStatus: 'in_progress',
        progress: {
          completedSteps: currentStep - 1,
          totalSteps: 7,
          completedStepLabels: [],
          currentStep: `Step ${currentStep}`,
        },
      };
    }

    // Case 3: completed → also check brand kit for is_paid
    if (onboardingStatus === 'completed') {
      const brandKit = await this.db.query<{ is_paid: boolean }>(
        'SELECT is_paid FROM brand_kits WHERE user_id = $1 LIMIT 1',
        [userId],
      );

      const isPaid = brandKit[0]?.is_paid ?? false;

      return {
        onboardingStatus: 'completed',
        isPaid,
      };
    }

    // ✅ fallback for TypeScript safety
    throw new Error(`Unhandled onboardingStatus: ${String(onboardingStatus)}`);
  }
}
