import { DatabaseService } from 'src/common/database/database.service';

export async function fetchFlyerByUserId(
  db: DatabaseService,
  userId: string,
): Promise<{ image_url: string } | null> {
  const result = await db.query<{ image_url: string }>(
    `SELECT image_url FROM flyers WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return result[0] ?? null;
}
