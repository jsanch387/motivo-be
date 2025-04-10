// src/features/brandKit/helpers/maybeMarkOnboardingComplete.ts

import { DatabaseService } from 'src/common/database/database.service';
import { MARK_ONBOARDING_COMPLETE } from '../../queries/onboarding.queries';

/**
 * Marks onboarding as complete if current step is 7
 */
export async function maybeMarkOnboardingComplete(
  userId: string,
  currentStep?: number,
  db?: DatabaseService,
): Promise<void> {
  if (currentStep === 7 && db) {
    await db.query(MARK_ONBOARDING_COMPLETE, [userId]);
    console.log('✅ Onboarding marked as complete.');
  } else {
    console.log('ℹ️ Onboarding not marked complete — still in progress.');
  }
}
