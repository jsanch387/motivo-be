// src/modules/ai/ai.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
import { uploadFlyerBufferToStorage } from '../onboarding/utils/flyer/uploadFlyerBufferToStorage';

@Injectable()
export class AiService {
  constructor(
    private readonly googleAiService: GoogleAIService,
    private readonly openaiService: OpenAIService,
    private readonly db: DatabaseService,
  ) {}

  async generate(
    type: string,
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any = {},
  ): Promise<string[] | string[][]> {
    switch (type) {
      case 'business_names':
        return this.generateBusinessNames(userId, body.alreadySuggested || []);
      case 'brand_colors':
        return this.generateColorPalettes(userId);
      default:
        throw new Error(`Unsupported generation type`);
    }
  }

  private async generateBusinessNames(
    userId: string,
    alreadySuggested: string[],
  ): Promise<string[]> {
    const onboarding = await this.fetchNameContext(userId);
    if (!onboarding?.service_type) {
      throw new Error('Missing service_type for user');
    }

    const prompt = buildBusinessNamePrompt(
      onboarding.service_type,
      onboarding.location,
      alreadySuggested,
    );

    const raw = await this.openaiService.generateCompletion(prompt);
    return parseBusinessNameResponse(raw);
  }

  private async generateColorPalettes(userId: string): Promise<string[][]> {
    const context = await this.fetchColorContext(userId);

    if (!context?.service_type || !context?.business_name) {
      throw new NotFoundException('Missing context for color generation');
    }

    const prompt = buildColorPalettePrompt(
      context.service_type,
      context.business_name,
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
      selected_business_name: string | null;
      custom_name: string | null;
    }>(SELECT_COLOR_CONTEXT, [userId]);

    const context = rows[0];
    if (!context) return null;

    return {
      service_type: context.service_type,
      business_name:
        context.selected_business_name || context.custom_name || '',
    };
  }

  async generateLogos(userId: string, style: string): Promise<string[]> {
    // Step 1: Fetch logo generation context
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

    // Step 2: Fetch optional business name
    const businessNameResult = await this.db.query<{
      selected_business_name: string;
    }>(`SELECT selected_business_name FROM onboarding WHERE user_id = $1`, [
      userId,
    ]);

    const businessName = businessNameResult?.[0]?.selected_business_name;

    console.log('🧩 Generating logos (hybrid prompt) for user:', userId);
    console.log('Style:', style);
    console.log('Service Type:', serviceType);
    console.log('Brand Colors:', brandColors);
    console.log('Business Name:', businessName);

    // Step 3: Build a single balanced prompt
    const prompt = buildLogoPrompt(
      serviceType,
      style,
      brandColors,
      businessName,
    );

    // Step 4: Generate 3 images with a single call
    const logoBuffers = await this.openaiService.generateImage(
      prompt,
      '1024x1024',
      3,
    );

    // Step 5: Convert Buffers to base64 image URLs
    const base64Urls = logoBuffers.map((buffer) => {
      return `data:image/png;base64,${buffer.toString('base64')}`;
    });

    return base64Urls;
  }

  async generateFlyer(userId: string): Promise<string> {
    const context = await fetchFlyerContext(this.db, userId);

    if (!context) {
      throw new NotFoundException(
        'Missing onboarding context for flyer generation',
      );
    }

    const flyerPrompt = buildFlyerPrompt(context);

    // Step 1: Generate image (returns Buffer[])
    const [flyerBuffer] = await this.openaiService.generateImage(
      flyerPrompt,
      '1024x1536',
      1, // generate just 1 flyer
    );

    if (!flyerBuffer) {
      throw new Error('No flyer image generated');
    }

    // Step 2: Upload to Supabase Storage
    const flyerUrl = await uploadFlyerBufferToStorage(userId, flyerBuffer);

    // Step 3: Save flyer URL in the database
    await saveFlyerToDB(this.db, userId, flyerUrl);

    return flyerUrl;
  }
}
