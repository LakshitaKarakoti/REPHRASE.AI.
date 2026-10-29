export type ToneType = 'Formal' | 'Friendly' | 'Firm' | 'Concise' | 'Persuasive' | 'Empathetic';

export type FormatType = 'email' | 'chat' | 'bullet_points' | 'quick_reply';

export type LengthType = 'concise' | 'balanced' | 'detailed';

export interface DraftResult {
  subject?: string;
  body: string;
  toneDescription: string;
  highlights: string[];
  alternativeOpeners?: string[];
  toneUsed: ToneType;
  recipient: string;
  format: FormatType;
  timestamp: number;
}

export interface ToneComparison {
  formal: { subject?: string; body: string; nuance: string };
  friendly: { subject?: string; body: string; nuance: string };
  firm: { subject?: string; body: string; nuance: string };
}

export interface HistoryItem {
  id: string;
  rawNotes: string;
  draft: DraftResult;
  isStarred?: boolean;
  createdAt: number;
}
