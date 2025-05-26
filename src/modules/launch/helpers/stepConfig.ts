// Maps step keys to their corresponding DB columns in launch_guides
export const stepColumnMap = {
  'post-flyer': 'flyer_captions',
  'message-network': 'network_scripts',
  'first-offer': 'launch_offers',
} as const;

export type LaunchStepKey = keyof typeof stepColumnMap;

export const launchSteps: string[] = [
  'create-profile',
  'post-flyer',
  'message-network',
  'first-offer',
];
