// src/modules/ai/helpers/parseColorPaletteResponse.ts
export function parseColorPaletteResponse(raw: string): string[][] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (palette) =>
          Array.isArray(palette) &&
          palette.length === 3 &&
          palette.every(
            (color) => typeof color === 'string' && color.startsWith('#'),
          ),
      )
    ) {
      throw new Error('Invalid color structure');
    }

    return parsed as string[][];
  } catch (err) {
    console.error('❌ Failed to parse color palette response:', err);
    throw new Error('Invalid AI response format for brand colors');
  }
}
