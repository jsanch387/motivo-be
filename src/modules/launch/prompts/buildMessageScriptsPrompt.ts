// prompts/buildMessageScriptsPrompt.ts
export function buildMessageScriptsPrompt(serviceType: string) {
  return `
You're helping a small business owner spread the word about their new local service.

Business type: "${serviceType}"

Write 3 short, friendly message scripts they can send to friends, neighbors, or acquaintances. These should feel personal, casual, and helpful — not overly salesy.

Use this exact JSON format:
{
  "scripts": [
    "Hey! Just wanted to let you know I started offering [service] in the area...",
    "Hi! I’m doing [service] now and would love your support spreading the word...",
    ...
  ]
}
Respond with valid JSON only. No commentary.
  `.trim();
}
