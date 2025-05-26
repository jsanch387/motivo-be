export function buildFlyerCaptionsPrompt(serviceType: string): string {
  return `
You are an expert social media marketer helping local service businesses attract their first customers.

The business type is: "${serviceType}"

Your task is to write exactly 3 short, engaging social media captions (under 20 words each) that a user can post alongside their business flyer on Facebook or Instagram.

These should sound real, conversational, and persuasive — like something a small business owner would post to promote their services in a local Facebook group.

Return ONLY valid JSON in the exact format below:
{
  "captions": [
    "Example caption 1 here",
    "Example caption 2 here",
    "Example caption 3 here"
  ]
}

Do not include any extra commentary, explanations, or formatting outside of this strict JSON structure.
  `;
}
