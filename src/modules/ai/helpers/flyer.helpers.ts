import { DatabaseService } from 'src/common/database/database.service';
import { SELECT_FLYER_CONTEXT, UPSERT_FLYER } from '../queries/ai.queries';

export async function fetchFlyerContext(
  db: DatabaseService,
  userId: string,
): Promise<{
  selected_business_name: string;
  service_type: string;
  location: string;
  slogan: string;
} | null> {
  const result = await db.query<{
    selected_business_name: string;
    service_type: string;
    location: string;
    slogan: string;
  }>(SELECT_FLYER_CONTEXT, [userId]);

  return result[0] ?? null;
}

export async function saveFlyerToDB(
  db: DatabaseService,
  userId: string,
  imageUrl: string,
): Promise<void> {
  await db.query(UPSERT_FLYER, [userId, imageUrl]);
}
