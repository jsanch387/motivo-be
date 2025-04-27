import { DatabaseService } from 'src/common/database/database.service';

export async function insertGeneratedLogo(
  db: DatabaseService,
  logo: {
    user_id: string;
    style: string;
    image_url: string;
    service_type: string;
    colors: string[];
  },
): Promise<void> {
  await db.query(
    `
      INSERT INTO logos (user_id, style, image_url, service_type, colors)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [logo.user_id, logo.style, logo.image_url, logo.service_type, logo.colors],
  );
}
