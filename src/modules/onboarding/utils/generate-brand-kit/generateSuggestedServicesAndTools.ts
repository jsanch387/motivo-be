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

  try {
    const raw = await openaiService.generateCompletion(prompt);
    const parsed = parseServiceAndToolResponse(raw);

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
    console.error('❌ Failed to generate AI brand kit suggestions:', error);
    return { suggestedServices: [], suggestedTools: [] };
  }
}
