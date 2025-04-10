import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';

import { AuthGuard } from 'src/common/guards/auth.guard';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';

import { RequestWithUser } from 'src/common/utils/RequestWithUser';
import { GetOnboardingResponseDto } from './dto/getOnboardingResponseDto';
import { OnboardingService } from './onboarding.service';
import { BrandKitResponseDto } from './dto/brandKitResponseDto';

@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('save')
  async saveProgress(
    @Body() body: SaveOnboardingDto,
    @Req() req: RequestWithUser,
  ): Promise<{ success: true }> {
    const userId = req['user']?.id;

    console.log(
      '📝 [POST /onboarding/save] Incoming save request for user:',
      userId,
    );
    console.log('📦 Request Body:', body);

    await this.onboardingService.saveProgress(userId, body);

    console.log('✅ Onboarding progress saved successfully for user:', userId);
    return { success: true };
  }

  @Get('fetch')
  async fetchOnboarding(
    @Req() req: RequestWithUser,
  ): Promise<ReturnType<typeof this.onboardingService.fetchOnboarding>> {
    const userId = req.user.id; // ✅ changed from `sub` to `id`
    return await this.onboardingService.fetchOnboarding(userId);
  }

  @Get('status')
  async getOnboardingStatus(
    @Req() req: RequestWithUser,
  ): Promise<GetOnboardingResponseDto> {
    const userId = req.user?.id; // ✅ changed from `sub` to `id`

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    const result: GetOnboardingResponseDto =
      await this.onboardingService.getOnboardingData(userId);
    return result;
  }

  @Get('generate')
  async generateBrandKit(
    @Req() req: RequestWithUser,
  ): Promise<BrandKitResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    const result: BrandKitResponseDto =
      await this.onboardingService.generateBrandKit(userId);
    return result;
  }

  @Get('brand-kit')
  async getBrandKit(@Req() req: RequestWithUser): Promise<BrandKitResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return await this.onboardingService.getBrandKitByUserId(userId);
  }
}
