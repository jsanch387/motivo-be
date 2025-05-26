/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LaunchStepData, StepCompleteResponse } from './dto/launch.dto';
import { DatabaseService } from 'src/common/database/database.service';
import { OpenAIService } from 'src/common/openai/openai.service';
import { stepPromptMap } from './helpers/stepPromptMap';
import {
  INSERT_LAUNCH_GUIDE,
  SELECT_LAUNCH_GUIDE_STEP_DATA,
  MARK_STEP_COMPLETE,
  buildUpdateStepDataQuery,
  SELECT_ONBOARDING_CONTEXT,
  GET_COMPLETED_STEPS,
} from './queries/launchGuide.queries';
import { stepColumnMap } from './helpers/stepConfig';

@Injectable()
export class LaunchService {
  constructor(
    private readonly db: DatabaseService,
    private readonly openAiService: OpenAIService,
  ) {}

  /**
   * Called from Stripe webhook → creates launch_guide entry
   */
  async createLaunchGuideForUser(userId: string): Promise<void> {
    await this.db.query(INSERT_LAUNCH_GUIDE, [userId]);
  }

  /**
   * Frontend → get steps + completed status
   */
  // async getLaunchGuide(userId: string): Promise<LaunchGuideResponse> {
  //   const row = await this.db.queryOneOrNull<{ completed_steps: string[] }>(
  //     SELECT_COMPLETED_STEPS,
  //     [userId],
  //   );

  //   if (!row) throw new NotFoundException('Launch guide not found');

  //   return {
  //     userId,
  //     steps: launchSteps.map((stepKey) => ({
  //       stepKey,
  //       completed: row.completed_steps.includes(stepKey),
  //       data: {}, // Placeholder — step data loaded on demand
  //     })),
  //   };
  // }

  /**
   * Frontend → user opens step → return data or generate AI content
   */
  async getStepData(userId: string, stepKey: string): Promise<LaunchStepData> {
    const row = await this.db.queryOneOrNull<{
      flyer_captions: any;
      network_scripts: any;
      launch_offers: any;
      completed_steps: string[];
    }>(SELECT_LAUNCH_GUIDE_STEP_DATA, [userId]);

    if (!row) throw new NotFoundException('Launch guide not found');

    const column = stepColumnMap[stepKey as keyof typeof stepColumnMap];
    let data = column ? row[column] : null;

    const aiStepKeys = Object.keys(stepColumnMap);
    const needsAi =
      aiStepKeys.includes(stepKey) && (!data || Object.keys(data).length === 0);

    if (needsAi) {
      const aiData = await this.generateAiContentForStep(userId, stepKey);
      await this.db.query(buildUpdateStepDataQuery(column), [aiData, userId]);
      data = aiData;
    }

    return {
      stepKey,
      completed: row.completed_steps.includes(stepKey),
      data,
    };
  }

  /**
   * Frontend → user clicks Mark Complete → add step to array
   */
  async markStepComplete(
    userId: string,
    stepKey: string,
  ): Promise<StepCompleteResponse> {
    await this.db.query(MARK_STEP_COMPLETE, [stepKey, userId]);

    return {
      success: true,
      step: { stepKey, completed: true },
    };
  }

  /**
   * Internal → handles AI generation for any AI step
   */
  private async generateAiContentForStep(userId: string, stepKey: string) {
    const context = await this.db.queryOneOrNull<{
      service_type: string;
      location: string;
    }>(SELECT_ONBOARDING_CONTEXT, [userId]);

    if (!context)
      throw new BadRequestException('No onboarding context found for user');

    const stepHandler = stepPromptMap[stepKey as keyof typeof stepPromptMap];

    if (!stepHandler) {
      throw new BadRequestException(`No AI handler for step: ${stepKey}`);
    }

    const prompt = stepHandler.buildPrompt({
      service_type: context.service_type,
    });
    const aiResponse = await this.openAiService.generateJsonWithRetries(prompt);
    return stepHandler.parser(aiResponse);
  }
  //move query to queries file
  async getCompletedSteps(userId: string): Promise<string[]> {
    const row = await this.db.queryOneOrNull<{ completed_steps: string[] }>(
      GET_COMPLETED_STEPS,
      [userId],
    );

    if (!row) throw new NotFoundException('Launch guide not found');

    return row.completed_steps;
  }
}
