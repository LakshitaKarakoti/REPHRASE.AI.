import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { X, Trash2, Bookmark, BookmarkCheck, ArrowUpRight, Clock, Search } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onToggleStar: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onToggleStar,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filterStarred && !item.isStarred) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.rawNotes.toLowerCase().includes(term) ||
      item.draft.body.toLowerCase().includes(term) ||
      (item.draft.subject && item.draft.subject.toLowerCase().includes(term)) ||
      item.draft.recipient.toLowerCase().includes(term) ||
      item.draft.toneUsed.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">
              Draft History ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-slate-100 space-y-2 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past notes or drafts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setFilterStarred(!filterStarred)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                filterStarred
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-3 h-3 text-amber-500" />
              <span>Starred Only</span>
            </button>

            {items.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved drafts found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all bg-white group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.draft.toneUsed}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      → {item.draft.recipient}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStar(item.id)}
                      className="p-1 text-slate-300 hover:text-amber-500"
                    >
                      {item.isStarred ? (
                        <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                      title="Load this draft"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                  {item.draft.body}
                </p>

                <div className="text-[10px] text-slate-400 truncate">
                  Raw: "{item.rawNotes}"
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
