export function buildLogoPrompt(
  serviceType: string,
  style: string,
  brandColors: string[],
): string {
  const colorText = brandColors.length
    ? `Incorporate the following brand colors where appropriate: ${brandColors.join(
        ', ',
      )}.`
    : '';

  const baseRules = `
- No text, letters, or words
- White background
- Flat SVG-style design
- No gradients or shadows
- Clean and professional look
- Must be easily scalable and recognizable as an app icon or favicon`;

  const styleDescriptions: Record<string, string> = {
    modern_minimalist: `Design should be sleek, minimal, and geometric. Focus on simplicity and clarity.`,
    friendly_approachable: `Design should be soft, rounded, and welcoming. Aim for a friendly vibe.`,
    bold_high_impact: `Design should be strong, striking, and use bold shapes or contrast.`,
  };

  const styleDescription = styleDescriptions[style] || '';

  return `
Create a logo for a business that offers: ${serviceType}

Style: ${style.replace(/_/g, ' ')}
${styleDescription}

${colorText}

${baseRules}
`.trim();
}
