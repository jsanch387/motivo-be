import { BrandTool, Service } from '../dto/brandKitResponseDto';

export function parseServiceAndToolResponse(raw: string): {
  services: Service[];
  tools: BrandTool[];
} {
  try {
    const parsed = JSON.parse(raw);

    if (!parsed.services || !parsed.tools) {
      throw new Error('Missing `services` or `tools` keys');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services: Service[] = parsed.services.map((item: any) => {
      if (typeof item.name !== 'string' || typeof item.price !== 'number') {
        throw new Error('Invalid service format');
      }
      return {
        name: item.name,
        price: item.price,
        source: 'ai',
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools: BrandTool[] = parsed.tools.map((item: any) => {
      if (typeof item.name !== 'string') {
        throw new Error('Invalid tool format');
      }
      return {
        name: item.name,
        source: 'ai',
        checked: false,
      };
    });

    return { services, tools };
  } catch (err) {
    console.error('❌ Failed to parse service/tool response:', err);
    throw new Error('Invalid AI response format');
  }
}
