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

import { buildBusinessNamePrompt } from './prompt/buildBusinessNamePrompt';
import { parseBusinessNameResponse } from './helpers/parseBusinessNameResponse';

import { buildColorPalettePrompt } from './prompt/buildColorPalettePrompt';
import { parseColorPaletteResponse } from './helpers/parseColorPaletteResponse';
import { GoogleAIService } from 'src/common/genai/genai.service';

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

  async generateMinimalistLogo(userId: string): Promise<string> {
    const result = await this.db.query<{ service_type: string }>(
      SELECT_LOGO_CONTEXT,
      [userId],
    );

    const context = result?.[0];
    const serviceType = context?.service_type;

    if (!serviceType) {
      throw new NotFoundException('Missing logo context');
    }

    const prompt = `Create a high-quality logo design for a ${serviceType} business. The logo should be minimalistic, modern, SVG-style, and placed on a white background. Do not include any text. The design should be clean and professional, with simple geometric or abstract elements that represent the industry. Make sure there is not text anywhere only the logo itself`;

    const imageUrl = await this.googleAiService.generateImage(prompt);

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Invalid image data returned from Gemini');
    }

    return imageUrl;
  }
}
