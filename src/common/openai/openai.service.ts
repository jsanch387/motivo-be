/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { buildChecklistPrompt } from 'src/features/generate-checklist/GenerateChecklist/prompts/buildChecklistPrompt';
import { ChecklistJson } from 'src/features/generate-checklist/GenerateChecklist/types/checklist.types';
import { Questionnaire } from 'src/modules/ai/ai.service';

// src/modules/ai/types/guide-json.types.ts

/* ───────────── individual blocks ───────────── */

export interface GuideCover {
  title: string;
  subtitle?: string; // optional
  author: string;
  bio: string;
}

export interface GuideIntro {
  headline: string;
  context: string[]; // 2+ paragraphs
  audience: string;
}

export interface GuideSection {
  title: string;
  goal: string; // one-sentence outcome
  body: string[]; // 2+ rich paragraphs
  example: string; // mini case study
  key_points: string[]; // exactly 5 bullets
  tip?: string; // 1–2 sentences
}

export interface GuideSummary {
  key_takeaways: string[]; // 4–6 bullets
}

/* ───────────── top-level container ───────────── */

export interface GuideJson {
  cover: GuideCover;
  intro: GuideIntro;
  sections: GuideSection[];
  summary: GuideSummary;
}

@Injectable()
export class OpenAIService {
  private openai;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }

  async generateImage(
    prompt: string,
    size: '1024x1024' | '1024x1536' | '1536x1024' = '1024x1024',
    count: number = 1,
  ): Promise<Buffer[]> {
    const response = await this.openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: count,
      size,
      quality: 'high',
    });

    const images = response.data;

    if (!images || images.length === 0) {
      throw new Error('No images returned from OpenAI');
    }

    return images.map((img) => {
      if (!img.b64_json) throw new Error('Missing base64 data in response');
      return Buffer.from(img.b64_json, 'base64');
    });
  }

  async generateJsonWithRetries<T>(prompt: string, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await this.generateCompletion(prompt);

      // Clean Markdown ```json formatting
      const cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const parsed = JSON.parse(cleaned) as T;
        console.log(parsed);

        return parsed;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        console.warn(`Attempt ${attempt} failed to parse JSON:`, cleaned);
        if (attempt === maxRetries) {
          throw new Error(
            'Failed to generate valid JSON from OpenAI after retries',
          );
        }
      }
    }

    throw new Error('Unreachable');
  }

  async generateGuideContent(q: Questionnaire): Promise<GuideJson> {
    const prompt = `
You are an expert creator coach. Using the answers below, write a **PAID digital guide**.
Return **only** valid JSON (no markdown fences) in the exact schema shown.

{
  "cover": {
    "title": "",
    "subtitle": "",
    "author": "",
    "bio": ""                        // 80‑100 words, credentials + fun fact
  },
  "intro": {
    "headline": "",
    "context": ["", ""],             // exactly TWO paragraphs
    "audience": ""
  },
  "sections": [
    {
      "title": "",
      "goal": "",
      "body": ["", ""],              // exactly TWO paragraphs
      "example": "",
      "key_points": ["", "", "", "", ""],
      "tip": ""
    }
  ],
  "summary": {
    "key_takeaways": ["", "", "", "", ""]
  }
}

INPUT CONTEXT
- Audience: ${q.audience}
- Niche / Topic: ${q.niche}
- Content type & tone: ${q.content_type}
- Main struggle: ${q.main_struggle}
- Mini‑class idea: ${q.mini_class}
- Top follower questions: ${q.top_questions.join('; ')}
- Extra notes: ${q.extra_notes ?? 'none'}

RULES
1. Write at an 8th‑grade reading level. Define any unavoidable jargon the first time.
2. Produce **4–6 sections**.
3. **Each body paragraph** must be **140‑180 words** and include **at least one statistic, study, or citation** relevant to the niche.  
   • Format citations inline in parentheses, e.g., (J Am Acad Dermatol 2023) or (WHO 2024).  
4. key_points = exactly 5 bullets, ≤25 words each, each starting with an action verb.
5. tip = 1–2 sentences, ≤40 words total.
6. Do **NOT** wrap the JSON in back‑ticks or add commentary.
8. In each section’s paragraph 2, include either (a) a worked example with numbers or (b) a 3-step micro-tutorial the reader can follow immediately.
`;

    return this.generateJsonWithRetries<GuideJson>(prompt, 2);
  }

  /** Generates checklist JSON from questionnaire */
  async generateChecklistContent(q: Questionnaire): Promise<ChecklistJson> {
    const prompt = buildChecklistPrompt(q);
    return this.generateJsonWithRetries<ChecklistJson>(prompt, 2);
  }
}
