/* eslint-disable @typescript-eslint/no-explicit-any */
// stepPromptMap.ts

import { buildFlyerCaptionsPrompt } from '../prompts/buildFlyerCaptionsPrompt';
import { buildMessageScriptsPrompt } from '../prompts/buildMessageScriptsPrompt';
import { buildOfferIdeasPrompt } from '../prompts/buildOfferIdeasPrompt';

export const stepPromptMap = {
  'post-flyer': {
    buildPrompt: (ctx: { service_type: string }) =>
      buildFlyerCaptionsPrompt(ctx.service_type),
    parser: (res: any) => res as { captions: string[] },
  },
  'message-network': {
    buildPrompt: (ctx: { service_type: string }) =>
      buildMessageScriptsPrompt(ctx.service_type),
    parser: (res: any) => res as { scripts: string[] },
  },
  'first-offer': {
    buildPrompt: (ctx: { service_type: string }) =>
      buildOfferIdeasPrompt(ctx.service_type),
    parser: (res: any) => res as { offers: string[] },
  },
} as const;

export type StepKey = keyof typeof stepPromptMap;
