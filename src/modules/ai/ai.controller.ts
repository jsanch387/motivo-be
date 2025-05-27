import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithUser } from 'src/common/utils/RequestWithUser';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(
    @Query('type') type: string,
    @Body() body: { alreadySuggested?: string[] },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id;

    if (!type || !userId) {
      throw new BadRequestException('Missing required params: type and userId');
    }

    const result = await this.aiService.generate(type, userId, body);
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

    // This returns an array of logo URLs
    const imageUrls = await this.aiService.generateLogos(userId, style);

    // ✅ Return them as an array under "urls"
    res.status(200).json({ urls: imageUrls });
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
