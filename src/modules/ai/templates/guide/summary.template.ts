// templates/guide/summary.template.ts
export type SummaryOptions = {
  key_takeaways: string[]; // 4–6 bullets
  title?: string; // default “Key Takeaways” if omitted
};

export function buildSummaryHtml({
  title = 'Key Takeaways',
  key_takeaways,
}: SummaryOptions): string {
  return /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0;padding:0;background:#ffffff;">
      <div style="
        font-family:'Manrope',-apple-system,BlinkMacSystemFont,sans-serif;
        padding:80px 60px;color:#1a1a1a;max-width:800px;margin:0 auto;
        page-break-after:always;
      ">
        <!-- Header -->
        <h2 style="font-size:32px;font-weight:700;margin:0 0 16px;color:#0f172a;">
          ${title}
        </h2>
        <div style="width:80px;height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;margin-bottom:32px;"></div>

        <!-- Bullet list -->
        <ul style="padding:0;margin:0 0 40px;list-style:none;display:grid;gap:14px;">
          ${key_takeaways
            .map(
              (t) => `
            <li style="
              padding:18px 22px;background:#f8fafc;border-left:4px solid #6366f1;
              border-radius:8px;font-size:16px;color:#334155;line-height:1.6;
            ">
              ${t}
            </li>`,
            )
            .join('')}
        </ul>

        <!-- Encouraging footer -->
        <div style="text-align:center;">
          <p style="font-size:18px;font-weight:600;color:#0f172a;margin:0 0 12px;">
            Ready to put this into action?
          </p>
          <p style="font-size:15px;color:#475569;max-width:520px;margin:0 auto 28px;line-height:1.6;">
            Revisit these takeaways whenever you need a quick refresher—and share your wins with your audience!
          </p>
          <div style="display:inline-block;padding:12px 24px;background:#6366f1;border-radius:8px;">
            <span style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.3px;">
              YOU'VE GOT THIS 💪
            </span>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}
