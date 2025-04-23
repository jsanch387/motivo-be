import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type OpenAIImageSize = '1024x1024' | '1024x1792' | '1792x1024';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCompletion(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }

  async generateImage(
    prompt: string,
    size: OpenAIImageSize = '1024x1024',
  ): Promise<string> {
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'hd',
      style: 'vivid',
    });

    const url = response.data[0]?.url;
    if (!url) throw new Error('OpenAI failed to return image URL');
    return url;
  }
}
