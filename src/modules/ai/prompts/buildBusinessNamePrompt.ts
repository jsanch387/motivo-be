export function buildBusinessNamePrompt(
  serviceType: string,
  location?: string,
): string {
  return `
You are an expert brand consultant. Suggest 6 professional and brandable business names for a new company.

Business type: ${serviceType}
${location ? `Target region: ${location}` : ''}

Guidelines:
- Names should be short, professional, and trustworthy
- Avoid humor, slang, or gimmicks
- You may include the location if it sounds natural
- Return only a JSON array of strings — no extra text

Format:
[
  "Name One",
  "Name Two",
  ...
]
`.trim();
}
