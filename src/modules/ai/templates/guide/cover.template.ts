// templates/guide/cover.template.ts
export type CoverOptions = {
  title: string;
  subtitle?: string;
  author: string;
  bio?: string; // NEW – 80‑100‑word author blurb
  niche?: string;
};

export function buildCoverHtml({
  title,
  subtitle,
  author,
  bio,
  niche,
}: CoverOptions): string {
  return /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0;padding:0;">
      <div style="
        width:100%;height:100vh;display:flex;align-items:center;justify-content:center;
        background:#ffffff;page-break-after:always;position:relative;overflow:hidden;
        font-family:'Manrope',-apple-system,BlinkMacSystemFont,sans-serif;
      ">
        <!-- Decorative blobs -->
        <div style="position:absolute;top:-100px;right:-100px;width:300px;height:300px;border-radius:30% 70% 70% 30%/30% 30% 70% 70%;background:#f8fafc;opacity:0.8;"></div>
        <div style="position:absolute;bottom:-150px;left:-150px;width:400px;height:400px;border-radius:60% 40% 30% 70%/60% 30% 70% 40%;background:#f5f3ff;opacity:0.6;"></div>

        <div style="max-width:640px;padding:80px 60px;text-align:center;position:relative;z-index:1;">
          ${
            niche
              ? `<div style="margin-bottom:28px;display:inline-block;padding:8px 20px;background:#f8fafc;border-radius:24px;font-size:13px;font-weight:600;letter-spacing:0.8px;color:#64748b;text-transform:uppercase;border:1px solid #e2e8f0;">${niche}</div>`
              : ''
          }

          <h1 style="font-size:48px;font-weight:700;margin:0 0 12px;line-height:1.15;color:#0f172a;">
            ${title}
          </h1>

          ${
            subtitle
              ? `<h2 style="font-size:24px;font-weight:500;margin:0 0 28px;color:#475569;">${subtitle}</h2>`
              : ''
          }

          <div style="width:100px;height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);margin:0 auto 32px;border-radius:4px;opacity:0.8;"></div>

          <p style="font-size:15px;color:#64748b;margin:0 0 6px;">by</p>
          <p style="font-size:20px;font-weight:600;color:#0f172a;margin:0 0 24px;">${author}</p>

          ${
            bio
              ? `<p style="font-size:16px;line-height:1.6;color:#475569;margin:0 auto;max-width:520px;">
                   ${bio}
                 </p>`
              : ''
          }
        </div>
      </div>
    </body>
  </html>`;
}
