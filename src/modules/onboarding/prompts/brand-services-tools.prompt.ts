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
  const hasServices = existingServices.length > 0;
  const hasTools = existingTools.length > 0;

  const serviceIntro = `
You are helping someone start or grow their ${serviceType} business. 
Your job is to recommend services and tools that are profitable and aligned with their stage.

All service prices must:
- Factor in realistic business costs (labor, time, materials, travel if mobile)
- Reflect fair market value in the U.S. (not too low, not overpriced)
- Leave room for the business owner to make a solid profit
`;

  const servicesSection = hasServices
    ? `
The user already offers these services:
${existingServices.map((s) => `- ${s.name} ($${s.price})`).join('\n')}

Suggest 6 additional services that:
- Fill in gaps or expand their current offerings
- Help them increase average ticket size or serve more use cases
- Are not redundant with their current services
`
    : `
The user has not added any services yet.

Suggest 6 starter services that:
- Are common for new ${serviceType} businesses
- Are relatively easy to deliver for someone starting out
- Will generate profit while being valuable to customers
`;

  const toolsSection = hasTools
    ? `
They already own these tools:
${existingTools.map((t) => `- ${t.name}`).join('\n')}

Suggest 8 more tools that:
- Improve efficiency, service quality, or safety
- Unlock new services they could offer
- Are cost-effective (don’t suggest luxury gear)
`
    : `
The user doesn’t have any tools yet.

Suggest 8 beginner-friendly tools that:
- Are essential for starting a ${serviceType} business
- Are affordable but still get the job done well
`;

  const formatSection = `
Return your response as a JSON object like this:
{
  "services": [
    { "name": "Service Name", "price": 75 }
  ],
  "tools": [
    { "name": "Tool Name" }
  ]
}
`;

  return `
${serviceIntro}
${servicesSection}
${toolsSection}
${formatSection}
`.trim();
}
