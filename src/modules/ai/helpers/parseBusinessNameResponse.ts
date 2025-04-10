export function parseBusinessNameResponse(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    if (!parsed.every((name) => typeof name === 'string')) {
      throw new Error('Array items must be strings');
    }
    return parsed.slice(0, 6);
  } catch (err) {
    console.error('❌ Failed to parse business name response:', err);
    throw new Error('Invalid AI response format');
  }
}
