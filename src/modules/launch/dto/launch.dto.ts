// launch.dto.ts

export interface LaunchStepData {
  stepKey: string;
  completed: boolean;
  data: Record<string, unknown>;
}

export interface LaunchGuideResponse {
  userId: string;
  steps: LaunchStepData[];
}

export interface StepCompleteResponse {
  success: boolean;
  step: {
    stepKey: string;
    completed: boolean;
  };
}
