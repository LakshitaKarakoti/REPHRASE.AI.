import React, { useState } from 'react';
import { ToneComparison, ToneType } from '../types';
import { X, Copy, Check, Briefcase, Smile, ShieldAlert, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: ToneComparison | null;
  recipient: string;
  onSelectToneDraft: (tone: ToneType, subject: string | undefined, body: string, nuance: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  comparison,
  recipient,
  onSelectToneDraft,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !comparison) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const columns = [
    {
      tone: 'Formal' as ToneType,
      title: 'Formal Tone',
      icon: Briefcase,
      badge: 'Diplomatic & Polished',
      headerBg: 'bg-slate-900 text-white',
      badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
      data: comparison.formal,
    },
    {
      tone: 'Friendly' as ToneType,
      title: 'Friendly Tone',
      icon: Smile,
      badge: 'Warm & Approachable',
      headerBg: 'bg-emerald-700 text-white',
      badgeClass: 'bg-emerald-800 text-emerald-100 border-emerald-600',
      data: comparison.friendly,
    },
    {
      tone: 'Firm' as ToneType,
      title: 'Firm Tone',
      icon: ShieldAlert,
      badge: 'Direct & Assertive',
      headerBg: 'bg-indigo-700 text-white',
      badgeClass: 'bg-indigo-800 text-indigo-100 border-indigo-600',
      data: comparison.firm,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col max-h-[92vh] border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Tone Showdown: Formal vs. Friendly vs. Firm</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare how the same rough thoughts sound across all three primary tones for{' '}
              <strong className="text-slate-700">{recipient || 'the recipient'}</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-y-auto p-4 gap-4 md:gap-0 flex-1">
          {columns.map((col) => {
            const Icon = col.icon;
            const fullContent = col.data.subject
              ? `Subject: ${col.data.subject}\n\n${col.data.body}`
              : col.data.body;

            return (
              <div key={col.tone} className="flex flex-col md:px-4 first:pl-0 last:pr-0">
                {/* Column Header */}
                <div className={`p-3 rounded-xl mb-3 flex items-center justify-between ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-bold text-sm">{col.title}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${col.badgeClass}`}>
                    {col.badge}
                  </span>
                </div>

                {/* Nuance Note */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 mb-3 italic">
                  💡 {col.data.nuance}
                </div>

                {/* Subject if present */}
                {col.data.subject && (
                  <div className="mb-2 p-2 rounded-lg bg-slate-100/70 border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Subject:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {col.data.subject}
                    </span>
                  </div>
                )}

                {/* Message Body */}
                <div className="flex-1 bg-slate-50/60 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-72 min-h-48 mb-3 font-sans">
                  {col.data.body}
                </div>

                {/* Column Footer Actions */}
                <div className="pt-2 flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => handleCopy(fullContent, col.tone)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                  >
                    {copiedKey === col.tone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onSelectToneDraft(col.tone, col.data.subject, col.data.body, col.data.nuance);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                  >
                    <span>Use This</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
