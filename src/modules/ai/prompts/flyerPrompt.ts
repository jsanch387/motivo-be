type FlyerContext = {
  selected_business_name: string;
  service_type: string;
  location: string;
  slogan: string;
};

export function buildFlyerPrompt(context: FlyerContext): string {
  const { selected_business_name, service_type, location } = context;

  return `
Create a visually engaging and persuasive flyer for a small business.

BUSINESS NAME:
"${selected_business_name}"

BUSINESS TYPE:
${service_type}

LOCATION:
The business is based in or serves the area of: ${location}
If the location is a ZIP code, convert it to the appropriate city and state for use in the flyer (e.g., "78660" becomes "Pflugerville, TX"). Do not include raw zip codes in the final flyer.

GOAL:
Design a social-media-ready flyer that showcases what this business offers in a compelling way. It should attract attention on platforms like Instagram or work well as a printed poster or handout.

DESIGN REQUIREMENTS:
- Include strong, relevant imagery that matches the business type (e.g. visuals for car detailing, baked goods, landscaping, tutoring, etc.)
- You may include short, catchy marketing text or questions (e.g. “Need your car spotless?”, “Desserts made fresh!”) to draw attention
- Highlight the business name prominently
- Keep the layout clean, modern, and well-balanced
- Do not include contact information, phone numbers, email, or website
- Do not add watermarks or placeholder icons/logos
- Avoid using imagery that doesn't fit the industry
- Use flat design only (no drop shadows, 3D effects, or bevels)
- Don't include services offered, pricing, or any other details — keep it generic
- Very important: Do not make any spelling mistakes or typos

The final design should feel professional, bold, and clear.
`.trim();
}
