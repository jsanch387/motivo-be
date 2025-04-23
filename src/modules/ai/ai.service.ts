// src/modules/ai/ai.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpenAIService } from 'src/common/openai/openai.service';
import { DatabaseService } from 'src/common/database/database.service';

import {
  SELECT_COLOR_CONTEXT,
  SELECT_LOGO_CONTEXT,
  SELECT_NAME_CONTEXT,
} from './queries/ai.queries';

import { buildBusinessNamePrompt } from './prompts/buildBusinessNamePrompt';
import { parseBusinessNameResponse } from './helpers/parseBusinessNameResponse';

import { buildColorPalettePrompt } from './prompts/buildColorPalettePrompt';
import { parseColorPaletteResponse } from './helpers/parseColorPaletteResponse';
import { GoogleAIService } from 'src/common/genai/genai.service';
import { buildFlyerPrompt } from './prompts/flyerPrompt';
import { fetchFlyerContext, saveFlyerToDB } from './helpers/flyer.helpers';
import { buildLogoPrompt } from './prompts/buildLogoPrompt';
import { uploadFlyerToStorage } from '../onboarding/utils/flyer/uploadFlyerToStorage';

@Injectable()
export class AiService {
  constructor(
    private readonly googleAiService: GoogleAIService,
    private readonly openaiService: OpenAIService,
    private readonly db: DatabaseService,
  ) {}

  async generate(
    type: 'business_names' | 'brand_colors',
    userId: string,
  ): Promise<string[] | string[][]> {
    switch (type) {
      case 'business_names':
        return this.generateBusinessNames(userId);
      case 'brand_colors':
        return this.generateColorPalettes(userId);
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new BadRequestException(`Unsupported generation type: ${type}`);
    }
  }

  private async generateBusinessNames(userId: string): Promise<string[]> {
    const onboarding = await this.fetchNameContext(userId);
    if (!onboarding?.service_type) {
      throw new NotFoundException('Missing service_type for user');
    }

    const prompt = buildBusinessNamePrompt(
      onboarding.service_type,
      onboarding.location,
    );

    const raw = await this.openaiService.generateCompletion(prompt);
    return parseBusinessNameResponse(raw);
  }

  private async generateColorPalettes(userId: string): Promise<string[][]> {
    const onboarding = await this.fetchColorContext(userId);

    if (!onboarding?.service_type || !onboarding?.selected_business_name) {
      throw new NotFoundException('Missing context for color generation');
    }

    const prompt = buildColorPalettePrompt(
      onboarding.service_type,
      onboarding.selected_business_name,
    );

    const raw = await this.openaiService.generateCompletion(prompt);
    return parseColorPaletteResponse(raw);
  }

  private async fetchNameContext(userId: string) {
    const rows = await this.db.query<{
      service_type: string;
      location?: string;
    }>(SELECT_NAME_CONTEXT, [userId]);
    return rows[0];
  }

  private async fetchColorContext(userId: string) {
    const rows = await this.db.query<{
      service_type: string;
      selected_business_name: string;
    }>(SELECT_COLOR_CONTEXT, [userId]);
    return rows[0];
  }

  async generateLogo(userId: string, style: string): Promise<string> {
    const result = await this.db.query<{
      service_type: string;
      selected_color_palette: string[];
    }>(SELECT_LOGO_CONTEXT, [userId]);

    const context = result?.[0];
    const serviceType = context?.service_type;
    const brandColors = context?.selected_color_palette ?? [];

    if (!serviceType) {
      throw new NotFoundException('Missing logo context');
    }

    const prompt = buildLogoPrompt(serviceType, style, brandColors);

    const imageUrl = await this.openaiService.generateImage(prompt);
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Invalid image URL from OpenAI');
    }

    return imageUrl;
  }

  async generateFlyer(userId: string): Promise<string> {
    const context = await fetchFlyerContext(this.db, userId);

    if (!context) {
      throw new NotFoundException(
        'Missing onboarding context for flyer generation',
      );
    }

    const flyerPrompt = buildFlyerPrompt(context);

    // Step 1: Generate flyer image using OpenAI
    const openAiImageUrl = await this.openaiService.generateImage(
      flyerPrompt,
      '1024x1792',
    );

    if (!openAiImageUrl || typeof openAiImageUrl !== 'string') {
      throw new Error('Invalid flyer image returned from OpenAI');
    }

    // Step 2: Upload to Supabase Storage and get permanent URL
    const supabaseFlyerUrl = await uploadFlyerToStorage(userId, openAiImageUrl);

    // Step 3: Save permanent URL to DB
    await saveFlyerToDB(this.db, userId, supabaseFlyerUrl);

    return supabaseFlyerUrl;
  }
}
