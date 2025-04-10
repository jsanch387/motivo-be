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
