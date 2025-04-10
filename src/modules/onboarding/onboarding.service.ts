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

@Injectable()
export class OnboardingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly openaiService: OpenAIService,
    private readonly onboardingHelper: OnboardingHelperService,
  ) {}

  async saveProgress(userId: string, data: SaveOnboardingDto): Promise<void> {
    try {
      console.log(
        '📝 [POST /onboarding/save] Incoming save request for user:',
        userId,
      );
      console.log('📦 Request Body:', data);

      const status = await getCurrentOnboardingStatus(this.db, userId);
      console.log('📊 Current onboarding status:', status);

      if (status === 'completed') {
        console.warn('🚫 User has completed onboarding. Skipping update.');
        return;
      }

      const taggedServices = tagServicesWithSource(data.services);
      const normalizedTools = normalizeUserTools(data.tools); // ✅ consistent format

      const queryParams = [
        userId,
        data.current_step,
        data.service_type || null,
        data.location || null,
        data.readiness_level || null, // ✅ new field
        JSON.stringify(data.business_name_suggestions || []),
        data.selected_business_name || null,
        JSON.stringify(data.brand_color_options || []),
        JSON.stringify(data.selected_color_palette || []),
        JSON.stringify(data.logo_style_options || []),
        data.selected_logo_style || null,
        data.selected_logo_id || null,
        JSON.stringify(taggedServices),
        JSON.stringify(normalizedTools),
        data.slogan || null,
      ];

      if (!data.current_step) {
        throw new Error('❗ Missing required field: current_step');
      }

      if (status === 'not_started') {
        console.log('🆕 Creating new onboarding entry...');
        await this.db.query(INSERT_ONBOARDING_ROW, queryParams);
        console.log('✅ Onboarding row inserted');

        await this.db.query(UPDATE_PROFILE_ONBOARDING_STATUS, [userId]);
        console.log('✅ Profile onboarding status updated to in_progress');
      } else {
        console.log('✏️ Updating existing onboarding row...');
        await this.db.query(UPDATE_ONBOARDING_ROW, queryParams);
        console.log('✅ Onboarding row updated');
      }
    } catch (err) {
      console.error('❌ Failed to save onboarding data:', err);
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
          selected_logo_id: '',
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
      const brandKit = await fetchBrandKitByUserId(this.db, userId);
      return {
        brand_kit_status: 'completed',
        brand_kit: brandKit,
      };
    }

    throw new Error('Invalid onboarding status');
  }

  //   const rows = await this.db.query<FetchOnboardingDto>(
  //     SELECT_ONBOARDING_BY_USER,
  //     [userId],
  //   );

  //   if (!rows.length) {
  //     throw new NotFoundException('Onboarding data not found');
  //   }

  //   const onboarding = rows[0];

  //   // 🧼 Tag user services
  //   const userServices: Service[] = (onboarding.services || []).map((svc) => ({
  //     ...svc,
  //     source: 'user',
  //   }));

  //   // 🧠 Mock AI service suggestions to fill up to 6 total
  //   const mockedAiServices: Service[] = [
  //     { name: 'Tire Shine', price: 30, source: 'ai' },
  //     { name: 'Odor Elimination', price: 25, source: 'ai' },
  //     { name: 'Window Tint', price: 100, source: 'ai' },
  //     { name: 'Paint Protection', price: 150, source: 'ai' },
  //     { name: 'Scratch Removal', price: 70, source: 'ai' },
  //     { name: 'Eco-Friendly Wash', price: 60, source: 'ai' },
  //   ];

  //   const aiServices = mockedAiServices.slice(0, 6 - userServices.length);

  //   // 🧼 Tag tools safely (handle string or structured input)
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const userTools: BrandTool[] = (onboarding.tools || []).map((tool: any) => {
  //     if (typeof tool === 'string') {
  //       return { name: tool, source: 'user', checked: true };
  //     }
  //     return {
  //       name: tool.name,
  //       source: tool.source || 'user',
  //       checked: tool.checked ?? true,
  //     };
  //   });

  //   // 🧠 Mock AI tools to fill up to 8 total
  //   const mockedAiTools: BrandTool[] = [
  //     { name: 'Air Compressor', checked: false, source: 'ai' },
  //     { name: 'Water Tank', checked: false, source: 'ai' },
  //     { name: 'Drying Towels', checked: false, source: 'ai' },
  //     { name: 'Tool Belt', checked: false, source: 'ai' },
  //     { name: 'Sponge Kit', checked: false, source: 'ai' },
  //     { name: 'Portable Generator', checked: false, source: 'ai' },
  //     { name: 'Glass Cleaner', checked: false, source: 'ai' },
  //     { name: 'Floor Mats Cleaner', checked: false, source: 'ai' },
  //   ];

  //   const aiTools = mockedAiTools.slice(0, 8 - userTools.length);

  //   const brandKit: BrandKitResponseDto = {
  //     logo_url: onboarding.selected_logo_id || '',
  //     business_name: onboarding.selected_business_name || 'My Business',
  //     slogan: onboarding.slogan || 'Your go-to local service!',
  //     brand_colors: onboarding.selected_color_palette || [],
  //     services: [...userServices, ...aiServices],
  //     tools: [...userTools, ...aiTools],
  //     service_type: onboarding.service_type || '',
  //     location: onboarding.location || '',
  //     is_paid: false,
  //   };

  //   // 🧾 Save brand kit
  //   await this.db.query(
  //     `
  //     INSERT INTO brand_kits (
  //       user_id,
  //       logo_url,
  //       business_name,
  //       slogan,
  //       service_type,
  //       location,
  //       brand_colors,
  //       services,
  //       tools,
  //       is_paid
  //     ) VALUES (
  //       $1, $2, $3, $4, $5,
  //       $6, $7, $8, $9, $10
  //     )
  //   `,
  //     [
  //       userId,
  //       brandKit.logo_url,
  //       brandKit.business_name,
  //       brandKit.slogan,
  //       brandKit.service_type,
  //       brandKit.location,
  //       JSON.stringify(brandKit.brand_colors),
  //       JSON.stringify(brandKit.services),
  //       JSON.stringify(brandKit.tools),
  //       brandKit.is_paid,
  //     ],
  //   );

  //   console.log('✅ Brand kit saved to database');

  //   if (onboarding.current_step === 7) {
  //     await this.db.query(
  //       `UPDATE profiles SET onboarding_status = 'completed' WHERE user_id = $1`,
  //       [userId],
  //     );
  //     console.log('✅ Marked onboarding as completed');
  //   }

  //   return brandKit;
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // async generateBrandKit(userId: string): Promise<BrandKitResponseDto> {
  //   const rows = await this.db.query<FetchOnboardingDto>(
  //     SELECT_ONBOARDING_BY_USER,
  //     [userId],
  //   );
  //   if (!rows.length) {
  //     console.warn('❌ No onboarding data found for user:', userId);
  //     throw new NotFoundException('Onboarding data not found');
  //   }

  //   const onboarding = rows[0];
  //   console.log('🧾 Onboarding row fetched ✅');

  //   const userServices = normalizeUserServices(onboarding.services);
  //   const userTools = normalizeUserTools(onboarding.tools);

  //   console.log(
  //     `🧪 Found ${userServices.length} user service(s):`,
  //     userServices,
  //   );
  //   console.log(`🧪 Found ${userTools.length} user tool(s):`, userTools);

  //   const needsServices = userServices.length < 6;
  //   const needsTools = userTools.length < 8;

  //   let aiServices: Service[] = [];
  //   let aiTools: BrandTool[] = [];

  //   if (needsServices || needsTools) {
  //     const prompt = buildServiceAndToolPrompt({
  //       existingServices: userServices,
  //       existingTools: userTools,
  //       serviceType: onboarding.service_type || 'service',
  //     });

  //     console.log('🧠 Generated AI prompt:\n', prompt);

  //     try {
  //       const raw = await this.openaiService.generateCompletion(prompt);
  //       const parsed = parseServiceAndToolResponse(raw);

  //       const userServiceNames = new Set(
  //         userServices.map((s) => s.name.toLowerCase()),
  //       );
  //       aiServices = parsed.services.filter(
  //         (s) => !userServiceNames.has(s.name.toLowerCase()),
  //       );

  //       const userToolNames = new Set(
  //         userTools.map((t) => t.name.toLowerCase()),
  //       );
  //       aiTools = parsed.tools.filter(
  //         (t) => !userToolNames.has(t.name.toLowerCase()),
  //       );

  //       console.log('🤖 AI services (filtered):', aiServices);
  //       console.log('🤖 AI tools (filtered):', aiTools);
  //     } catch (error) {
  //       console.error('❌ Failed to generate AI brand kit suggestions:', error);
  //     }
  //   }

  //   const brandKit: BrandKitResponseDto = {
  //     logo_url: onboarding.selected_logo_id || '',
  //     business_name: onboarding.selected_business_name || 'My Business',
  //     slogan: onboarding.slogan || 'Your go-to local service!',
  //     brand_colors: onboarding.selected_color_palette || [],
  //     services: [...userServices, ...aiServices],
  //     tools: [...userTools, ...aiTools],
  //     service_type: onboarding.service_type || '',
  //     location: onboarding.location || '',
  //     is_paid: false, // 🔒 this will be used in the filter logic
  //   };

  //   console.log('💾 Saving brand kit to database...');
  //   await this.db.query(INSERT_BRAND_KIT, [
  //     userId,
  //     brandKit.logo_url,
  //     brandKit.business_name,
  //     brandKit.slogan,
  //     brandKit.service_type,
  //     brandKit.location,
  //     JSON.stringify(brandKit.brand_colors),
  //     JSON.stringify(brandKit.services),
  //     JSON.stringify(brandKit.tools),
  //     brandKit.is_paid,
  //   ]);
  //   console.log('✅ Brand kit saved.');

  //   if (onboarding.current_step === 7) {
  //     await this.db.query(MARK_ONBOARDING_COMPLETE, [userId]);
  //     console.log('✅ Onboarding marked as complete.');
  //   }

  //   const filteredKit = filterBrandKitByAccess(brandKit);
  //   console.log(
  //     filteredKit.is_paid
  //       ? '✅ Returning full brand kit (paid user)'
  //       : '🔒 Returning locked preview brand kit (unpaid user)',
  //   );

  //   return filteredKit;
  // }

  async generateBrandKit(userId: string): Promise<BrandKitResponseDto> {
    const onboarding = await this.onboardingHelper.fetchOnboardingData(userId);

    const userServices = normalizeUserServices(onboarding.services);
    const userTools = normalizeUserTools(onboarding.tools);

    const needsSuggestions = userServices.length < 6 || userTools.length < 8;

    const { suggestedServices, suggestedTools } = needsSuggestions
      ? await generateSuggestedServicesAndTools({
          serviceType: onboarding.service_type || '',
          existingServices: userServices,
          existingTools: userTools,
          openaiService: this.openaiService,
        })
      : { suggestedServices: [], suggestedTools: [] };

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

  // async getBrandKitByUserId(userId: string): Promise<BrandKitResponseDto> {
  //   const result = await this.db.query<BrandKitResponseDto>(
  //     SELECT_BRAND_KIT_BY_USER_ID,
  //     [userId],
  //   );

  //   if (!result.length) {
  //     throw new NotFoundException('Brand kit not found');
  //   }

  //   const rawKit = result[0];
  //   console.log('🧾 Raw brand kit from DB:', rawKit);

  //   const parsedServices: Service[] = rawKit.services || [];

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const parsedTools: BrandTool[] = (rawKit.tools || []).map((tool: any) => {
  //     if (typeof tool.name === 'object') {
  //       return {
  //         name: tool.name.name,
  //         source: tool.name.source,
  //         checked: tool.name.checked,
  //       };
  //     }
  //     return {
  //       name: tool.name,
  //       source: tool.source,
  //       checked: tool.checked,
  //     };
  //   });

  //   const fullKit: BrandKitResponseDto = {
  //     ...rawKit,
  //     brand_colors: rawKit.brand_colors || [],
  //     services: parsedServices,
  //     tools: parsedTools,
  //     logo_url: rawKit.logo_url,
  //   };

  //   const finalKit = filterBrandKitByAccess(fullKit);

  //   console.log(
  //     finalKit.is_paid
  //       ? '✅ Returning full brand kit (paid user)'
  //       : '🔒 Returning locked preview brand kit (unpaid user)',
  //   );

  //   return finalKit;
  // }

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
