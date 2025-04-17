export const SELECT_NAME_CONTEXT = `
  SELECT service_type, location
  FROM onboarding
  WHERE user_id = $1
  LIMIT 1
`;

export const SELECT_COLOR_CONTEXT = `
  SELECT service_type, selected_business_name
  FROM onboarding
  WHERE user_id = $1
  LIMIT 1
`;

export const SELECT_LOGO_CONTEXT = `
  SELECT service_type, selected_business_name, selected_color_palette
  FROM onboarding
  WHERE user_id = $1
  LIMIT 1
`;

export const SELECT_FLYER_CONTEXT = `
  SELECT selected_business_name, service_type, location, slogan
  FROM onboarding
  WHERE user_id = $1
  LIMIT 1
`;

export const UPSERT_FLYER = `
  INSERT INTO flyers (user_id, image_url)
  VALUES ($1, $2)
  ON CONFLICT (user_id) DO UPDATE
  SET image_url = EXCLUDED.image_url,
      updated_at = NOW()
`;
