// src/modules/ai/ai.controller.ts
import {
  Controller,
  Req,
  UseGuards,
  BadRequestException,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { AiService } from './ai.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithUser } from 'src/common/utils/RequestWithUser';

type Questionnaire = {
  content_type: string;
  niche: string;
  audience: string;
  top_questions: string[]; // already an array from the frontend
  mini_class: string;
  main_struggle: string;
  extra_notes?: string;
};

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POC endpoint:
   * Expects body.questionnaire with the creator's answers,
   * returns a PDF buffer.
   */
  @Post('generate-pdf')
  async generatePdf(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Body()
    body: { questionnaire: Questionnaire },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Missing user ID');

    const { questionnaire } = body;
    if (!questionnaire)
      throw new BadRequestException('Missing questionnaire payload');

    // Call your service — adjust the method name/signature as needed
    const pdfBuffer = await this.aiService.generatePdfFromQuestionnaire({
      userId,
      ...questionnaire,
    });

    res.header({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="generated.pdf"',
    });
    res.send(pdfBuffer);
  }

  /**
   * Generates a printable checklist add‑on.
   * Expects the same questionnaire payload; returns a PDF buffer.
   */
  @Post('generate-checklist')
  async generateChecklist(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Body() body: { questionnaire: Questionnaire },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Missing user ID');

    const { questionnaire } = body;
    if (!questionnaire) {
      throw new BadRequestException('Missing questionnaire payload');
    }

    const pdfBuffer = await this.aiService.generateChecklistFromQuestionnaire({
      userId,
      ...questionnaire,
    });

    res.header({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="checklist.pdf"',
    });
    res.send(pdfBuffer);
  }
}
