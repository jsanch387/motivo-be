import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithUser } from 'src/common/utils/RequestWithUser';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('generate')
  async generate(
    @Query('type') type: 'business_names' | 'brand_colors',
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id;

    if (!type || !userId) {
      throw new BadRequestException('Missing required params: type and userId');
    }

    const result = await this.aiService.generate(type, userId);
    return { result };
  }

  @Get('logo')
  async generateLogo(
    @Req() req: RequestWithUser,
    @Query('style') style: string,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }

    if (!style) {
      throw new BadRequestException('Missing logo style');
    }

    const imageUrl = await this.aiService.generateLogo(userId, style);

    res.status(200).json({ url: imageUrl });
  }

  @Get('flyer')
  async generateFlyer(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }

    const url = await this.aiService.generateFlyer(userId);
    return { url };
  }
}
