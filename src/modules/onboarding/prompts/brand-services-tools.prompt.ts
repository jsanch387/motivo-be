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
    servicesPart = `The user is starting a ${serviceType} business and already offers these services:\n${list}\nSuggest 6 additional services that make sense for this type of business, including reasonable prices that reflect industry standards.`;
  } else {
    servicesPart = `The user is starting a ${serviceType} business but hasn't added any services yet. Suggest 6 beginner-friendly services with realistic pricing for this industry.`;
  }

  let toolsPart = '';
  if (existingTools.length > 0) {
    const list = existingTools.map((t) => `- ${t.name}`).join('\n');
    toolsPart = `They already have these tools:\n${list}\nSuggest 8 more tools that are appropriate for a ${serviceType} business and would help improve service quality or unlock new offerings.`;
  } else {
    toolsPart = `They don't have any tools yet. Suggest 8 essential, beginner-friendly tools for starting a ${serviceType} business.`;
  }

  return `
${servicesPart}

${toolsPart}

Use this format:
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
