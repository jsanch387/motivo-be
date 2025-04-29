// src/modules/onboarding/onboarding.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { DatabaseService } from 'src/common/database/database.service';
import { GetOnboardingResponseDto } from './dto/getOnboardingResponseDto';
import {
  INSERT_ONBOARDING_ROW,
  SELECT_ONBOARDING_BY_USER,
  UPDATE_ONBOARDING_ROW,
  UPDATE_PROFILE_ONBOARDING_STATUS,
} from './queries/onboarding.queries';
import { BrandKitResponseDto, Service, Tool } from './dto/brandKitResponseDto';
import { getCurrentOnboardingStatus } from './utils/getCurrentOnboardingStatus';
import {
  fetchBrandKitByUserId,
  fetchOnboardingProgress,
  fetchProfileStatus,
  normalizeUserTools,
} from './utils/helpers';
import { tagServicesWithSource } from './utils/tagWithSource';
import { OpenAIService } from 'src/common/openai/openai.service';
import {
  filterBrandKitByAccess,
  normalizeUserServices,
} from './utils/brand-kit.utils';
import { SELECT_BRAND_KIT_BY_USER_ID } from './queries/brand-kit.queries';
import { OnboardingHelperService } from './utils/generate-brand-kit/onboardingHelper.service';
import { generateSuggestedServicesAndTools } from './utils/generate-brand-kit/generateSuggestedServicesAndTools';
import { buildBrandKit } from './utils/generate-brand-kit/buildBrandKit';
import { maybeMarkOnboardingComplete } from './utils/generate-brand-kit/maybeMarkOnboardingComplete';
import { fetchFlyerByUserId } from './utils/flyer/fetchFlyerByUser';
import { insertGeneratedLogo } from '../ai/helpers/logo.helpers';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly openaiService: OpenAIService,
    private readonly onboardingHelper: OnboardingHelperService,
  ) {}
  // async saveProgress(userId: string, data: SaveOnboardingDto): Promise<void> {
  //   try {
  //     console.log(
  //       '[POST /onboarding/save] Incoming save request for user:',
  //       userId,
  //     );
  //     console.log('Request Body:', data);

  //     const status = await getCurrentOnboardingStatus(this.db, userId);
  //     console.log('Current onboarding status:', status);

  //     if (status === 'completed') {
  //       console.warn('User has completed onboarding. Skipping update.');
  //       return;
  //     }

  //     const taggedServices = tagServicesWithSource(data.services);
  //     const normalizedTools = normalizeUserTools(data.tools);

  //     // ✅ Upload logo only if it's a base64 image
  //     let uploadedLogoUrl: string | null = null;

  //     if (data.selected_logo_url) {
  //       uploadedLogoUrl = await handleSelectedLogo(userId, data, this.db);
  //     }

  //     const queryParams = [
  //       userId,
  //       data.current_step,
  //       data.service_type || null,
  //       data.location || null,
  //       data.readiness_level || null,
  //       JSON.stringify(data.business_name_suggestions || []),
  //       data.selected_business_name || null,
  //       JSON.stringify(data.brand_color_options || []),
  //       JSON.stringify(data.selected_color_palette || []),
  //       JSON.stringify(data.logo_style_options || []),
  //       data.selected_logo_style || null,
  //       uploadedLogoUrl || null, // ✅ Only the uploaded Supabase URL is stored
  //       JSON.stringify(taggedServices),
  //       JSON.stringify(normalizedTools),
  //       data.slogan || null,
  //     ];

  //     if (!data.current_step) {
  //       throw new Error('Missing required field: current_step');
  //     }

  //     if (status === 'not_started') {
  //       console.log('Creating new onboarding entry...');
  //       await this.db.query(INSERT_ONBOARDING_ROW, queryParams);
  //       await this.db.query(UPDATE_PROFILE_ONBOARDING_STATUS, [userId]);
  //       console.log('Onboarding row created and status updated to in_progress');
  //     } else {
  //       console.log('Updating existing onboarding row...');
  //       await this.db.query(UPDATE_ONBOARDING_ROW, queryParams);
  //       console.log('Onboarding row updated');
  //     }
  //   } catch (err) {
  //     console.error('Failed to save onboarding data:', err);
  //     throw new InternalServerErrorException('Failed to save onboarding data');
  //   }
  // }

  async saveProgress(userId: string, data: SaveOnboardingDto): Promise<void> {
    try {
      console.log(
        '[POST /onboarding/save] Incoming save request for user:',
        userId,
      );
      console.log('Request Body:', data);

      const status = await getCurrentOnboardingStatus(this.db, userId);
      console.log('Current onboarding status:', status);

      if (status === 'completed') {
        console.warn('User has completed onboarding. Skipping update.');
        return;
      }

      const taggedServices = tagServicesWithSource(data.services);
      const normalizedTools = normalizeUserTools(data.tools);

      let uploadedLogoUrl: string | null = null;

      if (data.selected_logo_url) {
        uploadedLogoUrl = data.selected_logo_url;

        // ✅ Check if logo already exists before inserting
        const existingLogos = await this.db.query<{ id: string }>(
          `SELECT id FROM logos WHERE user_id = $1 AND image_url = $2`,
          [userId, uploadedLogoUrl],
        );

        if (existingLogos.length === 0) {
          await insertGeneratedLogo(this.db, {
            user_id: userId,
            style: data.selected_logo_style || 'unknown',
            image_url: uploadedLogoUrl,
            service_type: data.service_type || '',
            colors: data.selected_color_palette || [],
          });
          console.log('✅ Inserted new logo entry.');
        } else {
          console.log('✅ Logo already exists, skipping insert.');
        }
      }

      const queryParams = [
        userId,
        data.current_step,
        data.service_type || null,
        data.location || null,
        data.readiness_level || null,
        JSON.stringify(data.business_name_suggestions || []),
        data.selected_business_name || null,
        JSON.stringify(data.brand_color_options || []),
        JSON.stringify(data.selected_color_palette || []),
        JSON.stringify(data.logo_style_options || []),
        data.selected_logo_style || null,
        uploadedLogoUrl || null,
        JSON.stringify(taggedServices),
        JSON.stringify(normalizedTools),
        data.slogan || null,
      ];

      if (!data.current_step) {
        throw new Error('Missing required field: current_step');
      }

      if (status === 'not_started') {
        console.log('Creating new onboarding entry...');
        await this.db.query(INSERT_ONBOARDING_ROW, queryParams);
        await this.db.query(UPDATE_PROFILE_ONBOARDING_STATUS, [userId]);
        console.log('Onboarding row created and status updated to in_progress');
      } else {
        console.log('Updating existing onboarding row...');
        await this.db.query(UPDATE_ONBOARDING_ROW, queryParams);
        console.log('Onboarding row updated');
      }
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      throw new InternalServerErrorException('Failed to save onboarding data');
    }
  }

  async fetchOnboarding(userId: string): Promise<GetOnboardingResponseDto> {
    try {
      const rows = await this.db.query<GetOnboardingResponseDto>(
        SELECT_ONBOARDING_BY_USER,
        [userId],
      );

      if (!rows.length) {
        return {
          current_step: 1,
          brand_kit_status: 'not_started',
          service_type: '',
          location: '',
          readiness_level: '',
          business_name_suggestions: [],
          selected_business_name: '',
          brand_color_options: [],
          selected_color_palette: [],
          logo_style_options: ['Minimal', 'Playful', 'Bold'],
          selected_logo_style: '',
          selected_logo_url: '',
          services: [],
          tools: [],
          slogan: '',
        };
      }

      return rows[0];
    } catch (err) {
      console.error('❌ Failed to fetch onboarding data:', err);
      throw new InternalServerErrorException('Failed to fetch onboarding data');
    }
  }

  //gets the onboarding status of a user, if complete we return the brand kit
  async getOnboardingData(userId: string): Promise<GetOnboardingResponseDto> {
    const status = await fetchProfileStatus(this.db, userId);

    if (status === 'not_started') {
      return {
        brand_kit_status: 'not_started',
        current_step: 1,
      };
    }

    if (status === 'in_progress') {
      const onboardingData = await fetchOnboardingProgress(this.db, userId);
      return {
        brand_kit_status: 'in_progress',
        ...onboardingData,
      };
    }

    if (status === 'completed') {
      const [brandKit, flyer] = await Promise.all([
        fetchBrandKitByUserId(this.db, userId),
        fetchFlyerByUserId(this.db, userId), // 👈 new query to get the flyer
      ]);

      return {
        brand_kit_status: 'completed',
        brand_kit: brandKit,
        flyer_url: flyer?.image_url ?? null, // 👈 optional field
      };
    }

    throw new Error('Invalid onboarding status');
  }

  async generateBrandKit(userId: string): Promise<BrandKitResponseDto> {
    const onboarding = await this.onboardingHelper.fetchOnboardingData(userId);

    console.log('📦 Onboarding Data for Brand Kit:', onboarding);

    const userServices = normalizeUserServices(onboarding.services);
    const userTools = normalizeUserTools(onboarding.tools);

    const needsSuggestions = userServices.length < 6 || userTools.length < 8;

    let suggestedServices: Service[] = [];
    let suggestedTools: Tool[] = [];

    if (needsSuggestions) {
      try {
        const result = await generateSuggestedServicesAndTools({
          serviceType: onboarding.service_type || '',
          existingServices: userServices,
          existingTools: userTools,
          openaiService: this.openaiService,
        });

        suggestedServices = result.suggestedServices;
        suggestedTools = result.suggestedTools;

        // 🚨 If still missing after retries, we must fail.
        if (suggestedServices.length === 0 || suggestedTools.length === 0) {
          console.error('❌ Missing services or tools after AI generation.');
          throw new Error(
            'Unable to generate a complete brand kit. Missing services or tools.',
          );
        }
      } catch (error) {
        console.error('❌ Failed to generate AI brand kit suggestions:', error);
        throw new Error('Unable to generate brand kit: AI suggestion failed.');
      }
    }

    const brandKit = buildBrandKit({
      onboarding,
      userServices,
      userTools,
      suggestedServices,
      suggestedTools,
    });

    await this.onboardingHelper.saveBrandKitToDB(userId, brandKit);
    await maybeMarkOnboardingComplete(userId, onboarding.current_step, this.db);

    return filterBrandKitByAccess(brandKit);
  }

  async getBrandKitByUserId(
    userId: string,
    db: DatabaseService,
  ): Promise<BrandKitResponseDto> {
    const result = await db.query<BrandKitResponseDto>(
      SELECT_BRAND_KIT_BY_USER_ID,
      [userId],
    );

    if (!result.length) {
      throw new NotFoundException('Brand kit not found');
    }

    const raw = result[0];

    const parseTools = (tools: Tool[]): Tool[] =>
      (tools || []).map((tool) => ({
        id: tool.id ?? '',
        name: tool.name,
        checked: tool.checked ?? true,
      }));

    const parseServices = (services: Service[]): Service[] =>
      (services || []).map((svc) => ({
        id: svc.id ?? '',
        name: svc.name,
        price: svc.price,
      }));

    const fullKit: BrandKitResponseDto = {
      logo_url: raw.logo_url,
      business_name: raw.business_name,
      slogan: raw.slogan,
      service_type: raw.service_type,
      location: raw.location,
      brand_colors: raw.brand_colors || [],

      user_services: parseServices(raw.user_services || []),
      suggested_services: parseServices(raw.suggested_services || []),
      user_tools: parseTools(raw.user_tools || []),
      suggested_tools: parseTools(raw.suggested_tools || []),

      is_paid: raw.is_paid,
    };

    const finalKit = filterBrandKitByAccess(fullKit);

    console.log(
      finalKit.is_paid
        ? '✅ Returning full brand kit (paid user)'
        : '🔒 Returning locked preview brand kit (unpaid user)',
    );

    return finalKit;
  }
}
