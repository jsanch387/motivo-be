/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

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
      temperature: 0.7,
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
}
