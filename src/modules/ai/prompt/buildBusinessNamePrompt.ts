export function buildBusinessNamePrompt(
  serviceType: string,
  location?: string,
): string {
  return `
  You are a brand strategist helping someone launch a new side hustle.
  
  Side Hustle Type: ${serviceType}
  ${location ? `Location: ${location}` : ''}
  
  Generate 6 unique, catchy, and brandable business name suggestions for this business. 
  Return only a JSON array of strings with no other text.
  
  Example:
  [
    "Detail Dynasty",
    "Groom Go",
    "Fresh Ride Co.",
    "MobileSpark",
    "CleanScene",
    "AutoFlare"
  ]
  `;
}
