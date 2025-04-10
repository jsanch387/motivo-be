import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GoogleAIService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp-image-generation',
        contents: prompt, // ✅ just a plain string like in the docs
        config: {
          responseModalities: ['Text', 'Image'], // ✅ matches the docs
        },
      });

      const parts = response?.candidates?.[0]?.content?.parts ?? [];

      for (const part of parts) {
        if ('inlineData' in part && part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType ?? 'image/png';
          const base64 = part.inlineData.data;
          return `data:${mimeType};base64,${base64}`;
        }
      }

      throw new Error('No image found in Gemini response');
    } catch (error) {
      console.error('Google AI image generation error:', error);
      throw new Error('Failed to generate image from Gemini');
    }
  }
}
