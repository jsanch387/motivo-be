// templates/guide/intro.template.ts
export type IntroOptions = {
  headline: string;
  context: string[]; // array of paragraphs
  audience: string;
};

export function buildIntroHtml({
  headline,
  context,
  audience,
}: IntroOptions): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0;padding:0;">
      <div style="
        padding:80px 60px;background:#ffffff;color:#1a1a1a;max-width:800px;margin:0 auto;
        font-family:'Manrope',-apple-system,BlinkMacSystemFont,sans-serif;page-break-after:always;
      ">
        <h2 style="font-size:32px;font-weight:700;margin:0 0 24px;color:#0f172a;line-height:1.3;">
          ${headline}
        </h2>

        <div style="width:80px;height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;margin-bottom:28px;"></div>

        ${context
          .map(
            (p) =>
              `<p style="font-size:18px;line-height:1.7;color:#475569;margin:0 0 18px;">${p}</p>`,
          )
          .join('')}

        <p style="font-size:16px;color:#334155;font-weight:500;margin-top:32px;">
          <em>Written for: ${audience}</em>
        </p>
      </div>
    </body>
  </html>`;
}
