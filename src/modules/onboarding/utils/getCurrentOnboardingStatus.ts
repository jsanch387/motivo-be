import { DatabaseService } from 'src/common/database/database.service';
import { SELECT_PROFILE_ONBOARDING_STATUS } from '../queries/onboarding.queries';
import { NotFoundException } from '@nestjs/common';

export async function getCurrentOnboardingStatus(
  db: DatabaseService,
  userId: string,
): Promise<'not_started' | 'in_progress' | 'completed'> {
  const result = await db.query<{ onboarding_status: string }>(
    SELECT_PROFILE_ONBOARDING_STATUS,
    [userId],
  );

  if (!result.length) {
    throw new NotFoundException('User profile not found');
  }

  return result[0].onboarding_status as
    | 'not_started'
    | 'in_progress'
    | 'completed';
}
