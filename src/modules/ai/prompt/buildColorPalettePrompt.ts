// src/modules/ai/prompt/buildColorPalettePrompt.ts
export function buildColorPalettePrompt(
  serviceType: string,
  businessName: string,
): string {
  return `
  You are a branding expert helping a new business pick colors for their brand.
  
  Business Name: ${businessName}
  Service Type: ${serviceType}
  
  Generate 6 modern, professional color palettes suitable for this business. Each palette should include exactly 3 hex colors that work well together.
  
  Return ONLY a JSON array of arrays, where each inner array contains 3 hex strings. No additional text.
  
  Example:
  [
    ["#1E3A8A", "#3B82F6", "#BFDBFE"],
    ["#047857", "#10B981", "#6EE7B7"],
    ...
  ]
    `;
}
