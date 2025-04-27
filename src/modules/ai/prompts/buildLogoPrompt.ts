export function buildLogoPrompt(
  serviceType: string,
  style: string,
  brandColors: string[],
  businessName?: string,
): string {
  const styleMap: Record<string, string> = {
    modern_minimalist:
      'modern and minimalist — clean lines, simple shapes, high contrast',
    friendly_approachable:
      'friendly and approachable — rounded edges, soft forms, inviting feel',
    bold_high_impact:
      'bold and high-impact — sharp lines, strong contrast, confident design',
  };

  const styleLine = styleMap[style] || 'clean and professional';
  const colors = brandColors.length
    ? `Use these brand colors: ${brandColors.join(', ')}.`
    : '';

  return `
You are a professional brand designer creating a logo for a small business.

Business name: "${businessName ?? 'Your Brand'}"
Industry: ${serviceType}
Design style: ${styleLine}
${colors}

Your task is to generate **3 different logo concepts**. Use your expert judgment to include:
- At least one design that features the business name
- At least one design that is a clean, symbolic icon with no text

Guidelines:
- The logo must look good in a white background
- No mockups or backgrounds
- No gradients or 3D effects
- Logos should be scalable, vector-friendly, and suitable for use on websites, signs, and social media
- Keep it minimal, modern, and professional

Only return standalone logo images. Do not combine all concepts into one canvas.
`.trim();
}
