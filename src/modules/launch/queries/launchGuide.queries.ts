// Queries used by LaunchService
// ---------------------------------------

// Insert a launch_guide row if one doesn't exist
export const INSERT_LAUNCH_GUIDE = `
  INSERT INTO launch_guides (user_id) 
  VALUES ($1) 
  ON CONFLICT DO NOTHING
`;

//  Select step data and completed steps for a user
export const SELECT_LAUNCH_GUIDE_STEP_DATA = `
  SELECT flyer_captions, network_scripts, launch_offers, completed_steps 
  FROM launch_guides 
  WHERE user_id = $1
`;

//  Select completed steps only
export const SELECT_COMPLETED_STEPS = `
  SELECT completed_steps 
  FROM launch_guides 
  WHERE user_id = $1
`;

//  Mark a step as complete by appending it to completed_steps array
export const MARK_STEP_COMPLETE = `
  UPDATE launch_guides 
  SET completed_steps = array_append(completed_steps, $1),
      updated_at = NOW() 
  WHERE user_id = $2 
    AND NOT completed_steps @> ARRAY[$1]::text[]
`;

//  Dynamically build an update query to insert AI-generated content for a step
export const buildUpdateStepDataQuery = (column: string) => `
  UPDATE launch_guides 
  SET ${column} = $1,
      updated_at = NOW()
  WHERE user_id = $2
`;

//  Get context from onboarding (used for AI prompts)
export const SELECT_ONBOARDING_CONTEXT = `
  SELECT service_type, location 
  FROM onboarding 
  WHERE user_id = $1
`;

export const GET_COMPLETED_STEPS = `
 SELECT completed_steps FROM launch_guides WHERE user_id = $1
`;
