export const INSERT_BRAND_KIT = `
  INSERT INTO brand_kits (
    user_id, logo_url, business_name, slogan, service_type,
    location, brand_colors, services, tools, is_paid
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
`;

export const SELECT_BRAND_KIT_BY_USER_ID = `
  SELECT * FROM brand_kits
  WHERE user_id = $1
  LIMIT 1
`;
