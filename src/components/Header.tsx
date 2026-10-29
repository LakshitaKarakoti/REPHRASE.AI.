import React from 'react';
import { Sparkles, History, BookmarkCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onToggleHistory: () => void;
  historyCount: number;
  onReset: () => void;
  hasInput: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleHistory,
  historyCount,
  onReset,
  hasInput,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Rephrase<span className="text-indigo-600">.ai</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Tone Specialist
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Turn raw thoughts & rough notes into high-impact messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {hasInput && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
              title="Reset input fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={onToggleHistory}
            className="relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-indigo-600 bg-indigo-50 rounded-full border border-indigo-200">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
