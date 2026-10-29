import React from 'react';
import { ToneType } from '../types';
import { Briefcase, Smile, ShieldAlert, Zap, HeartHandshake, Scissors } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: ToneType;
  onChangeTone: (tone: ToneType) => void;
}

interface ToneOption {
  id: ToneType;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  colorClass: {
    active: string;
    border: string;
    icon: string;
    badge: string;
  };
}

const PRIMARY_TONES: ToneOption[] = [
  {
    id: 'Formal',
    label: 'Formal',
    badge: 'Polished',
    icon: Briefcase,
    description: 'Diplomatic, structured & respectful etiquette',
    colorClass: {
      active: 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-md',
      border: 'hover:border-slate-400 bg-white text-slate-800',
      icon: 'text-slate-600 group-hover:text-slate-900',
      badge: 'bg-slate-100 text-slate-700',
    },
  },
  {
    id: 'Friendly',
    label: 'Friendly',
    badge: 'Warm',
    icon: Smile,
    description: 'Approachable, warm & collaborative energy',
    colorClass: {
      active: 'bg-emerald-600 text-white ring-2 ring-emerald-600 shadow-md',
      border: 'hover:border-emerald-400 bg-white text-slate-800',
      icon: 'text-emerald-600 group-hover:text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  },
  {
    id: 'Firm',
    label: 'Firm',
    badge: 'Assertive',
    icon: ShieldAlert,
    description: 'Direct boundaries, clear accountability & no fluff',
    colorClass: {
      active: 'bg-indigo-600 text-white ring-2 ring-indigo-600 shadow-md',
      border: 'hover:border-indigo-400 bg-white text-slate-800',
      icon: 'text-indigo-600 group-hover:text-indigo-700',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  },
];

const SECONDARY_TONES: { id: ToneType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Concise', label: 'Concise / TL;DR', icon: Scissors },
  { id: 'Persuasive', label: 'Persuasive', icon: Zap },
  { id: 'Empathetic', label: 'Empathetic', icon: HeartHandshake },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onChangeTone,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>Target Tone</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-400">Select vibe & demeanor</span>
      </div>

      {/* Primary 3 Selector Buttons (Formal, Friendly, Firm) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PRIMARY_TONES.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTone === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTone(t.id)}
              className={`group relative flex flex-col p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? t.colorClass.active
                  : `${t.colorClass.border} border-slate-200 shadow-xs hover:bg-slate-50/70`
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold tracking-tight">
                    {t.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                    isSelected
                      ? 'bg-white/25 text-white border-transparent'
                      : t.colorClass.badge
                  }`}
                >
                  {t.badge}
                </span>
              </div>
              <p
                className={`text-[11px] leading-tight line-clamp-2 mt-1 ${
                  isSelected ? 'text-white/85' : 'text-slate-500'
                }`}
              >
                {t.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Extended Quick Options */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">
          More tones:
        </span>
        {SECONDARY_TONES.map((sec) => {
          const SecIcon = sec.icon;
          const isSelected = selectedTone === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onChangeTone(sec.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                isSelected
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SecIcon className="w-3 h-3 text-slate-400" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
