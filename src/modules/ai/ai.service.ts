// src/modules/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

import { OpenAIService } from 'src/common/openai/openai.service';
import { DatabaseService } from 'src/common/database/database.service';

/* existing string/handlebars builders – we'll adapt these later if needed */
import { buildCoverHtml } from './templates/guide/cover.template';
import { buildIntroHtml } from './templates/guide/intro.template';
import { buildSectionHtml } from './templates/guide/section.template';
import { buildSummaryHtml } from './templates/guide/summary.template';
import { ChecklistJson } from '../../features/generate-checklist/GenerateChecklist/types/checklist.types';
import { buildChecklistHtml } from '../../features/generate-checklist/GenerateChecklist/template/checklist.template';

/* ─────────────────────────────────────────── TYPES ── */

export type Questionnaire = {
  userId: string; // injected in controller
  content_type: string;
  niche: string;
  audience: string;
  top_questions: string[];
  mini_class: string;
  main_struggle: string;
  extra_notes?: string;
};

type GuideSection = {
  title: string;
  goal: string;
  body: string[]; // 2+ paragraphs
  example: string;
  key_points: string[];
  tip?: string;
};

type GuideJson = {
  cover: {
    title: string;
    subtitle?: string;
    author: string;
    bio: string;
  };
  intro: {
    headline: string;
    context: string[]; // paragraphs
    audience: string;
  };
  sections: GuideSection[];
  summary: {
    key_takeaways: string[];
  };
};

/* ─────────────────────────────────────────── SERVICE ── */

@Injectable()
export class AiService {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly db: DatabaseService,
  ) {}

  /* ---------- html → pdf helper ---------- */
  private async renderPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
    });

    await browser.close();
    return Buffer.from(pdf);
  }

  /* ---------- POC entry point ---------- */
  async generatePdfFromQuestionnaire(q: Questionnaire): Promise<Buffer> {
    /* 1️⃣  Build an OpenAI prompt & get structured guide JSON */
    const guide: GuideJson = await this.openaiService.generateGuideContent(q);

    /* 2️⃣  Convert guide JSON → HTML  */
    const coverHtml = buildCoverHtml({
      title: guide.cover.title,
      subtitle: guide.cover.subtitle,
      author: guide.cover.author,
      niche: q.niche, // optional – builder can ignore
      bio: guide.cover.bio, // optional – builder can ignore
    });

    const introHtml = buildIntroHtml({
      headline: guide.intro.headline,
      context: guide.intro.context,
      audience: guide.intro.audience,
    });

    const sectionsHtml = guide.sections
      .map((s) =>
        buildSectionHtml({
          title: s.title,
          goal: s.goal,
          body: s.body,
          example: s.example,
          key_points: s.key_points,
          tip: s.tip,
        }),
      )
      .join('');

    const summaryHtml = buildSummaryHtml({
      key_takeaways: guide.summary.key_takeaways,
    });

    /* 3️⃣  Stitch the page */
    const fullHtml = /* html */ `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${guide.cover.title}</title>
          <style>
            @page { margin: 0; }
            body  { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${coverHtml}
          ${introHtml}
          ${sectionsHtml}
          ${summaryHtml}
        </body>
      </html>
    `;

    /* 4️⃣  Render PDF */
    return this.renderPdf(fullHtml);
  }
  async generateChecklistFromQuestionnaire(q: Questionnaire): Promise<Buffer> {
    /** 1️⃣  Ask OpenAI to create checklist JSON */
    const checklist: ChecklistJson =
      await this.openaiService.generateChecklistContent(q);

    /** 2️⃣  Convert to HTML */
    const checklistHtml = buildChecklistHtml(checklist);

    /** 3️⃣  Wrap with minimal page chrome */
    const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${checklist.title}</title>
        <style>
          @page:first { margin-top: 0; }
          @page       { margin-top: 40px; }
          @page       { margin-left: 40px; margin-right: 40px; margin-bottom: 40px; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${checklistHtml}
      </body>
    </html>
  `;

    /** 4️⃣  Render PDF */
    return this.renderPdf(fullHtml);
  }
}
