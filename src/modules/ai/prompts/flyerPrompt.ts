type FlyerContext = {
  selected_business_name: string;
  service_type: string;
  location: string;
  slogan: string;
};

export function buildFlyerPrompt(context: FlyerContext): string {
  const { selected_business_name, service_type, location, slogan } = context;

  return `
      Create a visually engaging flyer for a business named "${selected_business_name}".
      This is a ${service_type} business located in ${location}.
      Include the slogan: "${slogan}".
      The flyer should be modern, bold, and social-media ready — good for Instagram or a printed poster.
      Use clear spacing, vibrant colors, and balance visual design with minimal text.
      Only include design — do not include placeholder contact details or watermarks.
    `.trim();
}
