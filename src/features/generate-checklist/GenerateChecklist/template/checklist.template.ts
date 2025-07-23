// templates/checklist.template.ts
export function buildChecklistHtml(data: {
  title: string;
  intro: string;
  usage: [string, string];
  items: { label: string; why: string }[];
  notes?: string;
  disclaimer?: string;
}): string {
  return `
  <section style="
    font-family:'Manrope',sans-serif;
    padding:96px 60px;
    max-width:860px;
    margin:0 auto;
    color:#0f172a;
  ">
    <!-- ✦Title block -->
    <h1 style="
      font-size:40px;
      font-weight:700;
      margin:0 0 10px;
      letter-spacing:-0.4px;
      line-height:1.25;
    ">
      ${data.title}
    </h1>



    <!-- Intro & usage -->
    <p style="font-size:18px;color:#475569;margin:0 0 10px;">
      ${data.intro}
    </p>

    <!-- Gradient divider -->
    <div style="
      width:140px;
      height:4px;
      background:linear-gradient(90deg,#6366f1,#8b5cf6);
      border-radius:4px;
      margin:0 0 20px;
    "></div>

    <p style="
      font-size:15px;
      color:#475569;
      margin:0 0 36px;
      line-height:1.6;
    ">
      ${data.usage[0]}<br>${data.usage[1]}
    </p>

    <!-- ✦Checklist -->
    <ul style="
      list-style:none;
      padding:0;
      margin:0;
      display:flex;
      flex-direction:column;
      gap:16px;
    ">
      ${data.items
        .map(
          (it) => `
        <li style="
          background:#ffffff;
          border:1px solid #e2e8f0;
          border-radius:12px;
          padding:20px 24px;
          display:flex;
          align-items:flex-start;
          gap:16px;
          box-shadow:0 3px 6px rgba(0,0,0,0.04);
        ">
          <!-- Checkbox -->
          <span style="
            width:22px;height:22px;border:2px solid #cbd5e1;border-radius:5px;
            flex-shrink:0;
            position:relative;
          "></span>

          <!-- Text -->
          <div style="display:flex;flex-direction:column;gap:6px;max-width:680px;">
            <span style="
              font-weight:600;
              font-size:17px;
              line-height:1.45;
            ">
              ${it.label}
            </span>
            <span style="font-size:14px;color:#475569;line-height:1.4;">
              ${it.why}
            </span>
          </div>
        </li>`,
        )
        .join('')}
    </ul>


    ${
      data.disclaimer
        ? `<p style="
             margin-top:24px;
             font-size:12px;
             color:#94a3b8;
             text-align:center;
           ">
             ${data.disclaimer}
           </p>`
        : ''
    }
  </section>`;
}
