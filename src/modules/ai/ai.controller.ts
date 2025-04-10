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
  async generateLogo(@Req() req: RequestWithUser, @Res() res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing required user ID');
    }

    const imageData = await this.aiService.generateMinimalistLogo(userId);

    const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestException('Invalid image data from Gemini');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline; filename=logo.png');
    res.send(buffer); // ✅ returns actual image data
  }
}
