// prompts/buildOfferIdeasPrompt.ts
export function buildOfferIdeasPrompt(serviceType: string) {
  return `
You are a business coach helping a new local ${serviceType} business launch.

Suggest 3 friendly, realistic first-time customer offers that could attract new clients. Offers should feel generous but not too sales-y. Keep them short and specific.

Respond ONLY in this format:
{
  "offers": [
    "Example offer 1",
    "Example offer 2",
    "Example offer 3"
  ]
}
Return valid JSON only. Do not include commentary or extra notes.
  `;
}
