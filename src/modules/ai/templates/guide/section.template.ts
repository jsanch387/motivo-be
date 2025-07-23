// templates/guide/section.template.ts
export interface SectionHtmlParams {
  title: string;
  goal: string;
  body: string[]; // paragraphs
  example: string; // mini case study
  key_points: string[]; // 5 bullets
  tip?: string;
}

export function buildSectionHtml({
  title,
  goal,
  body,
  example,
  key_points,
  tip,
}: SectionHtmlParams): string {
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
        <h2 style="font-size:32px;font-weight:700;margin:0 0 4px;color:#0f172a;letter-spacing:-0.5px;">
          ${title}
        </h2>
        <p style="font-size:15px;color:#64748b;margin:0 0 28px;font-weight:500;">
          Goal: ${goal}
        </p>

        <!-- Body paragraphs -->
        ${body
          .map(
            (p) =>
              `<p style="font-size:18px;line-height:1.7;color:#475569;margin:0 0 18px;">${p}</p>`,
          )
          .join('')}

        <!-- Example block -->
        <div style="
          background:#f8fafc;border-left:4px solid #6366f1;border-radius:8px;
          padding:20px;margin:24px 0;
        ">
          <p style="margin:0;color:#334155;font-size:16px;line-height:1.6;">
            <strong>Real-world example:</strong> ${example}
          </p>
        </div>

        <!-- Key points -->
        <h4 style="font-size:16px;font-weight:600;color:#1e40af;margin:0 0 12px;">
          Key Actions
        </h4>
        <ul style="padding:0;margin:0 0 32px;list-style:none;display:grid;gap:12px;">
          ${key_points
            .map(
              (pt) => `
            <li style="
              padding:14px 18px;background:#f8fafc;border-radius:8px;
              border:1px solid #f1f5f9;color:#334155;font-size:16px;line-height:1.5;
            ">
              ${pt}
            </li>`,
            )
            .join('')}
        </ul>

        <!-- Optional tip -->
        ${
          tip
            ? `<div style="
                padding:18px 20px;background:#ecfdf5;border-radius:8px;
                border-left:4px solid #10b981;margin-top:12px;
              ">
                <p style="margin:0;color:#065f46;font-size:16px;line-height:1.6;">
                  <strong>Pro Tip:</strong> ${tip}
                </p>
              </div>`
            : ''
        }
      </div>
    </body>
  </html>`;
}
