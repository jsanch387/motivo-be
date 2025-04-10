// src/modules/ai/prompt/buildMinimalistLogoPrompt.ts
export function buildMinimalistLogoPrompt(serviceType: string): string {
  return `
  Create a simple, clean SVG-style logo icon that visually represents the concept of:
  
  "${serviceType}"
  
  **Rules:**
  - No text, letters, or words
  - White background only
  - Flat black design (outline or filled)
  - Minimal detail
  - Abstract or symbolic shape only
  - No gradients, shadows, or photorealism
  - Should work well as a 16x16 favicon
  `.trim();
}
