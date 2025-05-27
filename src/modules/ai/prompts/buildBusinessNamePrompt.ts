export function buildBusinessNamePrompt(
  serviceType: string,
  location?: string,
  alreadySuggested: string[] = [],
): string {
  const blacklist = alreadySuggested.length
    ? `Avoid these names: ${alreadySuggested.map((name) => `"${name}"`).join(', ')}.`
    : '';

  return `
You are a professional brand strategist. Suggest 6 unique, professional business names for a new ${serviceType} company.

${location ? `The business operates in ${location}. You may include this in the name only if it sounds natural and brandable.` : ''}

Guidelines:
- Names should be short, memorable, and trustworthy
- Avoid using personal names, "LLC", numbers, or generic phrases
- Do NOT return basic names like "Daniel's ${serviceType}" or "Austin ${serviceType} LLC"
- Do NOT include repeated names or any from earlier suggestions
${blacklist}

Return only a valid JSON array of strings. No explanations, no labels, no extra text.

Format:
[
  "Business Name 1",
  "Business Name 2",
  "Business Name 3",
  ...
]
`.trim();
}
