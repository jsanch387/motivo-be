// import { BrandTool, Service } from '../dto/brandKitResponseDto';

// interface PromptOptions {
//   existingServices: Service[];
//   existingTools: BrandTool[];
//   serviceType: string;
// }

// export function buildServiceAndToolPrompt({
//   existingServices,
//   existingTools,
//   serviceType,
// }: PromptOptions): string {
//   const missingServiceCount = 6 - existingServices.length;
//   const missingToolCount = 8 - existingTools.length;

//   let servicesPart = '';
//   if (existingServices.length > 0) {
//     const list = existingServices
//       .map((s) => `- ${s.name} ($${s.price})`)
//       .join('\n');
//     servicesPart = `The user is starting a ${serviceType} business and already offers the following services:\n${list}\nSuggest ${missingServiceCount} more beginner-friendly services (with prices) to reach 6 total.`;
//   } else {
//     servicesPart = `The user is starting a ${serviceType} business but hasn't added any services yet. Suggest 6 beginner-friendly services (with prices).`;
//   }

//   let toolsPart = '';
//   if (existingTools.length > 0) {
//     const list = existingTools.map((t) => `- ${t.name}`).join('\n');
//     toolsPart = `They already have these tools:\n${list}\nSuggest ${missingToolCount} more tools they can buy to reach 8 total. Keep them beginner-friendly.`;
//   } else {
//     toolsPart = `They haven't added any tools yet. Suggest 8 beginner-friendly tools they can purchase to get started.`;
//   }

//   return `
// ${servicesPart}

// ${toolsPart}

// Return a JSON object like this:
// {
//   "services": [
//     { "name": "Service Name", "price": 50 }
//   ],
//   "tools": [
//     { "name": "Tool Name" }
//   ]
// }
// `.trim();
// }
