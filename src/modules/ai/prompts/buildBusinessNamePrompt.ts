export function buildBusinessNamePrompt(
  serviceType: string,
  location?: string,
  alreadySuggested: string[] = [],
): string {
  const blacklist = alreadySuggested.length
    ? `Avoid these names: ${alreadySuggested.map((name) => `"${name}"`).join(', ')}.`
    : '';

  return `
You are a professional brand strategist. Suggest 6 unique and trustworthy business names for a new company in the ${serviceType} industry.

${location ? `The business is based in ${location}. You may include this in the name only if it enhances the brand and sounds natural.` : ''}

Guidelines:
- Names should be professional, modern, and memorable
- Avoid puns, jokes, gimmicks, or slang
- Do NOT include personal names (like “Daniel’s Detailing”) or generic phrases (like “Austin LLC”)
- Do NOT use numbers, symbols, or legal suffixes like “LLC” or “Inc.”
- Names must be brandable and inspire confidence in the quality of service

${blacklist}

Return only a JSON array of 6 business name strings — no formatting, no extra explanation, no labels.

Format:
[
  "Business Name 1",
  "Business Name 2",
  "Business Name 3",
  ...
]
`.trim();
}
