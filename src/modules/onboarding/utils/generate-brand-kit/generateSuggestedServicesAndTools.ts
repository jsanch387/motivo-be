import { OpenAIService } from 'src/common/openai/openai.service';
import { Service, Tool } from '../../dto/brandKitResponseDto';
import { buildServiceAndToolPrompt } from '../../prompts/brand-services-tools.prompt';
import { parseServiceAndToolResponse } from '../../parsers/parseServiceAndToolResponse';

type GenerateInput = {
  serviceType: string;
  existingServices: Service[];
  existingTools: Tool[];
  openaiService: OpenAIService;
};

type GenerateOutput = {
  suggestedServices: Service[];
  suggestedTools: Tool[];
};

export async function generateSuggestedServicesAndTools({
  serviceType,
  existingServices,
  existingTools,
  openaiService,
}: GenerateInput): Promise<GenerateOutput> {
  const prompt = buildServiceAndToolPrompt({
    serviceType,
    existingServices,
    existingTools,
  });

  console.log('🧠 Generated AI prompt:\n', prompt);

  const maxRetries = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const raw = await openaiService.generateCompletion(prompt);

      // Clean markdown-style ```json ``` wrappers if present
      const cleaned = raw.replace(/```json|```/g, '').trim();

      const parsed = parseServiceAndToolResponse(cleaned);

      const existingServiceNames = new Set(
        existingServices.map((s) => s.name.toLowerCase()),
      );
      const existingToolNames = new Set(
        existingTools.map((t) => t.name.toLowerCase()),
      );

      const suggestedServices = parsed.services.filter(
        (s) => !existingServiceNames.has(s.name.toLowerCase()),
      );
      const suggestedTools = parsed.tools.filter(
        (t) => !existingToolNames.has(t.name.toLowerCase()),
      );

      return { suggestedServices, suggestedTools };
    } catch (error) {
      lastError = error;
      console.warn(`❌ Attempt ${attempt} failed to parse AI response:`, error);

      if (attempt > maxRetries) {
        throw new Error(
          `AI failed to return valid service/tool suggestions after ${maxRetries + 1} attempts.`,
        );
      }
    }
  }

  throw lastError;
}
