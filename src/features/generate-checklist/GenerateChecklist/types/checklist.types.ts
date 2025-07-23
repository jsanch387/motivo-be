/* ───────── checklist types ───────── */
export type ChecklistItem = {
  label: string;
  why: string;
  freq?: string;
};
export type ChecklistJson = {
  title: string;
  intro: string;
  usage: [string, string];
  items: ChecklistItem[];
  notes?: string;
  disclaimer?: string;
};

export type Questionnaire = {
  userId: string; // injected in controller
  content_type: string;
  niche: string;
  audience: string;
  top_questions: string[];
  mini_class: string;
  main_struggle: string;
  extra_notes?: string;
};
