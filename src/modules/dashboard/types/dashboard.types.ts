export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';

export interface DashboardProgress {
  completedSteps: number;
  totalSteps: number;
  completedStepLabels: string[];
  currentStep: string;
}

export interface DashboardNextStep {
  label: string;
  completed: boolean;
  action?: string;
}

export interface DashboardState {
  userId: string;
  onboardingStatus: OnboardingStatus;
  progress?: DashboardProgress;
  nextSteps?: DashboardNextStep[];
}

export interface DashboardResponse {
  onboardingStatus: OnboardingStatus;
  progress?: DashboardProgress;
  nextSteps?: DashboardNextStep[];
}
