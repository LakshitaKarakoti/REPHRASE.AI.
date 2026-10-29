import React, { useState } from 'react';
import { DraftResult } from '../types';
import {
  Copy,
  Check,
  Mail,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

interface DraftOutputProps {
  draft: DraftResult;
  onRefineDraft: (instruction: string) => void;
  isRefining: boolean;
  onToggleStar?: () => void;
  isStarred?: boolean;
  onUpdateDraftBody: (newBody: string) => void;
}

const QUICK_TWEAKS = [
  'Make it shorter & more concise',
  'Add a clear call to action',
  'Make the tone a little softer',
  'Make it more direct & firm',
  'Bulletize the key points',
];

export const DraftOutput: React.FC<DraftOutputProps> = ({
  draft,
  onRefineDraft,
  isRefining,
  onToggleStar,
  isStarred,
  onUpdateDraftBody,
}) => {
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [customTweak, setCustomTweak] = useState('');
  const [showTweakBar, setShowTweakBar] = useState(false);

  const handleCopyBody = () => {
    navigator.clipboard.writeText(draft.body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2200);
  };

  const handleCopySubject = () => {
    if (draft.subject) {
      navigator.clipboard.writeText(draft.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2200);
    }
  };

  const handleMailto = () => {
    const subject = encodeURIComponent(draft.subject || 'Message from Rephrase.ai');
    const body = encodeURIComponent(draft.body);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSwapOpener = (opener: string) => {
    // Replace first sentence or paragraph with opener
    const lines = draft.body.split('\n');
    let replaced = false;

    // If first line is a salutation (e.g. "Dear John," or "Hi Alex,"), replace the second non-empty line
    const newLines = lines.map((line, idx) => {
      if (!replaced && line.trim().length > 0) {
        if (
          idx === 0 &&
          (line.toLowerCase().startsWith('hi ') ||
            line.toLowerCase().startsWith('dear ') ||
            line.toLowerCase().startsWith('hello '))
        ) {
          return line;
        }
        replaced = true;
        return opener;
      }
      return line;
    });

    onUpdateDraftBody(newLines.join('\n'));
  };

  const wordCount = draft.body.trim().split(/\s+/).length;

  const toneTheme =
    draft.toneUsed === 'Formal'
      ? {
          badge: 'bg-slate-900 text-white',
          border: 'border-slate-300',
          bgHeader: 'bg-slate-50',
          accent: 'text-slate-800',
        }
      : draft.toneUsed === 'Friendly'
      ? {
          badge: 'bg-emerald-600 text-white',
          border: 'border-emerald-300',
          bgHeader: 'bg-emerald-50/60',
          accent: 'text-emerald-800',
        }
      : draft.toneUsed === 'Firm'
      ? {
          badge: 'bg-indigo-600 text-white',
          border: 'border-indigo-300',
          bgHeader: 'bg-indigo-50/60',
          accent: 'text-indigo-800',
        }
      : {
          badge: 'bg-blue-600 text-white',
          border: 'border-blue-300',
          bgHeader: 'bg-blue-50/60',
          accent: 'text-blue-800',
        };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Header bar */}
      <div className={`px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 ${toneTheme.bgHeader}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-2xs ${toneTheme.badge}`}>
            {draft.toneUsed} Tone
          </span>
          <span className="text-xs text-slate-500 font-medium">
            for <strong className="text-slate-700">{draft.recipient}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {wordCount} words
          </span>

          {onToggleStar && (
            <button
              onClick={onToggleStar}
              className={`p-1.5 rounded-lg border transition-colors ${
                isStarred
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
              }`}
              title={isStarred ? 'Saved to starred' : 'Star this draft'}
            >
              {isStarred ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={() => setShowTweakBar(!showTweakBar)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showTweakBar
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine</span>
          </button>
        </div>
      </div>

      {/* Refine / Tweak bar dropdown */}
      {showTweakBar && (
        <div className="p-3.5 bg-indigo-50/50 border-b border-indigo-100 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Refinements with Gemini</span>
            </span>
            <span className="text-[11px] text-indigo-600/80">Click preset or type instruction</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TWEAKS.map((tweak) => (
              <button
                key={tweak}
                disabled={isRefining}
                onClick={() => onRefineDraft(tweak)}
                className="px-2.5 py-1 text-xs bg-white text-slate-700 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {tweak}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customTweak.trim() && !isRefining) {
                onRefineDraft(customTweak.trim());
                setCustomTweak('');
              }
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={customTweak}
              onChange={(e) => setCustomTweak(e.target.value)}
              placeholder="Custom tweak: e.g. 'Add a line asking for a meeting Friday at 2pm'..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!customTweak.trim() || isRefining}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isRefining ? 'Applying...' : 'Apply Tweak'}
            </button>
          </form>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5 space-y-4 flex-1">
        {/* Subject Line for Email */}
        {draft.subject && (
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Subject Line
              </span>
              <button
                onClick={handleCopySubject}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {copiedSubject ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Subject</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 tracking-tight">
              {draft.subject}
            </p>
          </div>
        )}

        {/* Draft Body (Editable for convenience) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Message Draft
            </span>
            <span className="text-[10px] text-slate-400 italic">Editable text</span>
          </div>

          <textarea
            rows={8}
            value={draft.body}
            onChange={(e) => onUpdateDraftBody(e.target.value)}
            className="w-full p-4 text-sm text-slate-800 leading-relaxed bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans whitespace-pre-wrap resize-y"
          />
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBody}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                copiedBody
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copiedBody ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Message</span>
                </>
              )}
            </button>

            <button
              onClick={handleMailto}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Open in default email app"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email App</span>
            </button>
          </div>
        </div>

        {/* Tone Rationale & Highlights Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Why this phrasing works:</span>
            </div>
            <p className="text-slate-600 leading-relaxed pl-5">
              {draft.toneDescription}
            </p>
          </div>

          {draft.highlights && draft.highlights.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="font-semibold text-slate-600 block mb-1 pl-5">
                Key Improvements:
              </span>
              <ul className="space-y-1 pl-5">
                {draft.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {draft.alternativeOpeners && draft.alternativeOpeners.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="font-semibold text-slate-600 block mb-1.5 pl-5">
                Alternative Openers (Click to swap in):
              </span>
              <div className="pl-5 space-y-1.5">
                {draft.alternativeOpeners.map((opener, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSwapOpener(opener)}
                    className="w-full text-left p-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all text-slate-700 hover:text-indigo-900 shadow-2xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate italic">"{opener}"</span>
                    <span className="text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 shrink-0 ml-2">
                      Use this opener →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
