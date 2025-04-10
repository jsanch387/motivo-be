export const SELECT_PROFILE_ONBOARDING_STATUS = `
  SELECT onboarding_status FROM profiles WHERE user_id = $1
`;

export const UPDATE_PROFILE_ONBOARDING_STATUS = `
  UPDATE profiles SET onboarding_status = 'in_progress' WHERE user_id = $1
`;

export const INSERT_ONBOARDING_ROW = `
  INSERT INTO onboarding (
    user_id,
    current_step,
    service_type,
    location,
    readiness_level,
    business_name_suggestions,
    selected_business_name,
    brand_color_options,
    selected_color_palette,
    logo_style_options,
    selected_logo_style,
    selected_logo_id,
    services,
    tools,
    slogan
  ) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9,
    $10, $11, $12,
    $13, $14, $15
  )
`;

export const UPDATE_ONBOARDING_ROW = `
  UPDATE onboarding SET
    current_step = $2,
    service_type = $3,
    location = $4,
    readiness_level = $5,
    business_name_suggestions = $6,
    selected_business_name = $7,
    brand_color_options = $8,
    selected_color_palette = $9,
    logo_style_options = $10,
    selected_logo_style = $11,
    selected_logo_id = $12,
    services = $13,
    tools = $14,
    slogan = $15,
    updated_at = NOW()
  WHERE user_id = $1
`;

// export const SELECT_ONBOARDING_BY_USER = `
//   SELECT
//     user_id,
//     current_step,
//     service_type,
//     location,
//     readiness_level,
//     business_name_suggestions,
//     selected_business_name,
//     brand_color_options,
//     selected_color_palette,
//     logo_style_options,
//     selected_logo_style,
//     selected_logo_id,
//     services,
//     tools,
//     slogan
//   FROM onboarding
//   WHERE user_id = $1
//   LIMIT 1
// `;

export const SELECT_ONBOARDING_BY_USER = `
  SELECT * FROM onboarding WHERE user_id = $1
`;

export const MARK_ONBOARDING_COMPLETE = `
  UPDATE profiles SET onboarding_status = 'completed' WHERE user_id = $1
`;
