export type ProblemOptions = {
  title: string;
  body: string;
};

export function buildProblemHtml({ title, body }: ProblemOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2) format('woff2');
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0;">
      <div style="
        padding: 80px 60px;
        background: #ffffff;
        color: #1a1a1a;
        max-width: 800px;
        margin: 0 auto;
        font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        page-break-after: always;
      ">
        <!-- Section Header -->
        <h2 style="
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #0f172a;
          line-height: 1.3;
          letter-spacing: -0.5px;
        ">
          ${title}
        </h2>

        <!-- Decorative Gradient Bar -->
        <div style="
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #8b5cf6, #6366f1);
          border-radius: 4px;
          margin-bottom: 32px;
        "></div>

        <!-- Body Text -->
        <p style="
          font-size: 18px;
          line-height: 1.7;
          color: #475569;
          font-weight: 400;
          margin: 0;
          max-width: 700px;
        ">
          ${body}
        </p>
      </div>
    </body>
    </html>
  `;
}
