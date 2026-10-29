import React from 'react';
import { FormatType, LengthType } from '../types';
import { Sparkles, Mail, MessageSquare, ListFilter, CornerDownLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';

interface NotesInputProps {
  rawNotes: string;
  onChangeRawNotes: (val: string) => void;
  format: FormatType;
  onChangeFormat: (val: FormatType) => void;
  length: LengthType;
  onChangeLength: (val: LengthType) => void;
  onGenerate: () => void;
  onCompareTones: () => void;
  isGenerating: boolean;
  isComparing: boolean;
}

const SAMPLE_NOTES = [
  {
    title: 'Deadline extension',
    tag: 'Work',
    text: 'Need 2 more days on the budget presentation. Waiting for final revenue figures from marketing team, wont make Friday deadline. Will send finalized deck by Tuesday 10am.',
  },
  {
    title: 'Decline meeting',
    tag: 'Calendar',
    text: 'Cant make the sync tomorrow at 3pm, calendar is completely packed with customer escalations. Can you share the doc async or can we discuss on Slack instead?',
  },
  {
    title: 'Firm invoice reminder',
    tag: 'Finance',
    text: 'Invoice #849 was due 12 days ago. Need payment confirmation by this Friday otherwise services will be temporarily paused per agreement terms.',
  },
  {
    title: 'Constructor design feedback',
    tag: 'Review',
    text: 'Looked at the new landing page prototype. Fonts are all over the place, spacing is tight, and mobile buttons are hard to tap. Needs another polish pass before client call.',
  },
];

export const NotesInput: React.FC<NotesInputProps> = ({
  rawNotes,
  onChangeRawNotes,
  format,
  onChangeFormat,
  length,
  onChangeLength,
  onGenerate,
  onCompareTones,
  isGenerating,
  isComparing,
}) => {
  const wordCount = rawNotes.trim() ? rawNotes.trim().split(/\s+/).length : 0;
  const charCount = rawNotes.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (rawNotes.trim() && !isGenerating && !isComparing) {
        onGenerate();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Format & Length bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Format:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onChangeFormat('email')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
                format === 'email'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeFormat('chat')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
                format === 'chat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat / Slack</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeFormat('bullet_points')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
                format === 'bullet_points'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListFilter className="w-3 h-3" />
              <span>Bullets</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Length:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            {(['concise', 'balanced', 'detailed'] as LengthType[]).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => onChangeLength(len)}
                className={`capitalize px-2 py-1 rounded-md transition-colors font-medium text-[11px] ${
                  length === len
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Raw Notes Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="raw-notes-area"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
          >
            <span>Raw Thought or Rough Notes</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>
              {wordCount} words · {charCount} chars
            </span>
            {rawNotes && (
              <button
                type="button"
                onClick={() => onChangeRawNotes('')}
                className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative group">
          <textarea
            id="raw-notes-area"
            rows={5}
            value={rawNotes}
            onChange={(e) => onChangeRawNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or dump your rough thoughts here... Don't worry about grammar, tone, or etiquette. Just write what you mean to say."
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y shadow-2xs font-normal"
          />
        </div>
      </div>

      {/* Sample Starters */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Need inspiration? Try rough note samples:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => onChangeRawNotes(sample.text)}
              className="p-2 text-left rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-indigo-200 transition-all text-xs group cursor-pointer shadow-2xs"
            >
              <div className="font-semibold text-slate-700 group-hover:text-indigo-600 truncate">
                {sample.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {sample.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!rawNotes.trim() || isGenerating || isComparing}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer ${
            !rawNotes.trim() || isGenerating || isComparing
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/25 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Drafting Message with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Draft Message</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono text-white/90">
                ⌘↵
              </kbd>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCompareTones}
          disabled={!rawNotes.trim() || isGenerating || isComparing}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
            !rawNotes.trim() || isGenerating || isComparing
              ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-xs'
          }`}
          title="Compare Formal, Friendly, and Firm drafts side-by-side"
        >
          {isComparing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
              <span>Comparing Tones...</span>
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>Compare All 3 Tones</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
