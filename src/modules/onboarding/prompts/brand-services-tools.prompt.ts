import { Tool, Service } from '../dto/brandKitResponseDto';

interface PromptOptions {
  existingServices: Service[];
  existingTools: Tool[];
  serviceType: string;
}

export function buildServiceAndToolPrompt({
  existingServices,
  existingTools,
  serviceType,
}: PromptOptions): string {
  let servicesPart = '';
  if (existingServices.length > 0) {
    const list = existingServices
      .map((s) => `- ${s.name} ($${s.price})`)
      .join('\n');
    servicesPart = `The user is starting a ${serviceType} business and already offers the following services:\n${list}\nSuggest 6 additional services (with prices) that can expand or improve their offerings.`;
  } else {
    servicesPart = `The user is starting a ${serviceType} business but hasn't added any services yet. Suggest 6 beginner-friendly services (with prices).`;
  }

  let toolsPart = '';
  if (existingTools.length > 0) {
    const list = existingTools.map((t) => `- ${t.name}`).join('\n');
    toolsPart = `They already own these tools:\n${list}\nSuggest 8 additional tools that would help them deliver better results or unlock more services.`;
  } else {
    toolsPart = `They haven't added any tools yet. Suggest 8 beginner-friendly tools they can purchase to get started.`;
  }

  return `
${servicesPart}

${toolsPart}

Return a JSON object like this:
{
  "services": [
    { "name": "Service Name", "price": 50 }
  ],
  "tools": [
    { "name": "Tool Name" }
  ]
}
`.trim();
}
