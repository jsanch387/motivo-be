import { Questionnaire } from '../types/checklist.types';

export function buildChecklistPrompt(q: Questionnaire): string {
  const topic =
    q.mini_class?.trim() ||
    (q.top_questions.length ? q.top_questions[0] : 'Quick‑Start Checklist');

  return `
You are an experienced, results‑driven educator in the “${q.niche}” niche.
Create a **"${topic}"** checklist that is practical, straightforward, and
encouraging. Every item must tell the reader exactly what to do and why it
matters—no fluff, no jokes.

Return **ONLY** valid JSON (no markdown fences) in this schema:

{
  "title": "",                     // must include the topic
  "intro": "",                     // ≤25 words
  "usage": ["", ""],               // exactly TWO sentences (how to work the list)
  "items": [
    { "label": "", "why": "" }     // action + concise educational rationale
  ],
  "disclaimer": ""                 // niche‑appropriate safety line
}

INPUT
• Audience: ${q.audience}
• Main struggle: ${q.main_struggle || 'not specified'}
• Desired tone / style: ${q.content_type}
• Topic / focus: ${topic}
• Extra notes: ${q.extra_notes ?? 'none'}

RULES
1. Write at an 8‑grade reading level; professional and motivating, not playful.
2. Produce **8–12 checklist items** directly related to **"${topic}"**.
3. Each **label** begins with an action verb, ≤60 characters.  
   Each **why** ≤40 characters, states the benefit or purpose (e.g., “Reduces interest costs”).
4. intro = one sentence describing the goal.  
   usage = two sentences on how to apply and revisit the checklist.
5. If extra_notes contains a link, include it in notes (≤2 sentences with URL).
6. disclaimer: • Finance → “Not financial advice…” • Fitness → “Consult a physician…” • Skincare → “Patch‑test first…”, etc.
7. No commentary, markdown, or text outside the JSON object.
`;
}
