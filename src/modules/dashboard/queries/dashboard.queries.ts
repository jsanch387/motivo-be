// import { DashboardState } from '../types/dashboard.types';

// const mockDashboardDB: DashboardState[] = [
//   {
//     userId: 'not_started_user',
//     brandKitStatus: 'not_started',
//     progress: {
//       completedSteps: 0,
//       totalSteps: 6,
//       completedStepLabels: [],
//       currentStep: 'Start with Business Name',
//     },
//   },
//   {
//     userId: 'in_progress_user',
//     brandKitStatus: 'in_progress',
//     progress: {
//       completedSteps: 3,
//       totalSteps: 6,
//       completedStepLabels: ['Business Name', 'Logo', 'Color Palette'],
//       currentStep: 'Service & Pricing',
//     },
//   },
//   {
//     userId: 'completed_user',
//     brandKitStatus: 'completed',
//     nextSteps: [
//       {
//         label: 'Create Instagram Page',
//         completed: false,
//         action: 'Open Instagram',
//       },
//       {
//         label: 'Share with Friends',
//         completed: true,
//       },
//       {
//         label: 'Launch Website',
//         completed: false,
//         action: 'Go to Site Builder',
//       },
//     ],
//   },
// ];

// export function getMockDashboardData(
//   userId: string,
// ): Promise<DashboardState | null> {
//   const result =
//     mockDashboardDB.find((entry) => entry.userId === userId) || null;
//   return Promise.resolve(result);
// }
