import React, { useState, useEffect } from 'react';
import { ToneType, FormatType, LengthType, DraftResult, ToneComparison, HistoryItem } from './types';
import { Header } from './components/Header';
import { ToneSelector } from './components/ToneSelector';
import { RecipientSelector } from './components/RecipientSelector';
import { NotesInput } from './components/NotesInput';
import { DraftOutput } from './components/DraftOutput';
import { CompareModal } from './components/CompareModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AlertCircle, Sparkles, Wand2, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'rephrase_ai_history_v1';

export default function App() {
  const [rawNotes, setRawNotes] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('Formal');
  const [recipient, setRecipient] = useState('Boss / Manager');
  const [format, setFormat] = useState<FormatType>('email');
  const [length, setLength] = useState<LengthType>('balanced');

  const [currentDraft, setCurrentDraft] = useState<DraftResult | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [comparisonData, setComparisonData] = useState<ToneComparison | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newItems: HistoryItem[]) => {
    setHistory(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  // Generate single rephrase
  const handleGenerate = async () => {
    if (!rawNotes.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawNotes,
          tone: selectedTone,
          recipient,
          format,
          length,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Server error occurred during rephrasing');
      }

      const draftData: DraftResult = {
        subject: json.data.subject,
        body: json.data.body,
        toneDescription: json.data.toneDescription,
        highlights: json.data.highlights || [],
        alternativeOpeners: json.data.alternativeOpeners || [],
        toneUsed: selectedTone,
        recipient,
        format,
        timestamp: Date.now(),
      };

      setCurrentDraft(draftData);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: 'hist_' + Date.now(),
        rawNotes,
        draft: draftData,
        isStarred: false,
        createdAt: Date.now(),
      };
      setCurrentHistoryId(newHistoryItem.id);
      saveHistory([newHistoryItem, ...history.slice(0, 49)]);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorMessage(err.message || 'Something went wrong while generating with Gemini. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Compare Formal, Friendly, and Firm simultaneously
  const handleCompareTones = async () => {
    if (!rawNotes.trim()) return;
    setIsComparing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/compare-tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawNotes,
          recipient,
          format,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to compare tones.');
      }

      setComparisonData(json.data);
      setIsCompareOpen(true);
    } catch (err: any) {
      console.error('Tone comparison failed:', err);
      setErrorMessage(err.message || 'Failed to compare tones. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  // Refine an existing draft (e.g. "make it more concise", "softer")
  const handleRefineDraft = async (instruction: string) => {
    if (!currentDraft) return;
    setIsRefining(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDraft: currentDraft.body,
          instruction,
          recipient: currentDraft.recipient,
          tone: currentDraft.toneUsed,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to refine draft');
      }

      const updatedDraft: DraftResult = {
        ...currentDraft,
        subject: json.data.subject || currentDraft.subject,
        body: json.data.body,
        toneDescription: `${currentDraft.toneDescription} (Refined: ${json.data.changeSummary})`,
      };

      setCurrentDraft(updatedDraft);

      // Update in history if tracked
      if (currentHistoryId) {
        saveHistory(
          history.map((item) =>
            item.id === currentHistoryId ? { ...item, draft: updatedDraft } : item
          )
        );
      }
    } catch (err: any) {
      console.error('Refinement failed:', err);
      setErrorMessage(err.message || 'Failed to refine draft. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleUpdateDraftBody = (newBody: string) => {
    if (!currentDraft) return;
    const updated = { ...currentDraft, body: newBody };
    setCurrentDraft(updated);

    if (currentHistoryId) {
      saveHistory(
        history.map((item) =>
          item.id === currentHistoryId ? { ...item, draft: updated } : item
        )
      );
    }
  };

  const handleSelectToneFromCompare = (
    tone: ToneType,
    subject: string | undefined,
    body: string,
    nuance: string
  ) => {
    setSelectedTone(tone);
    const newDraft: DraftResult = {
      subject,
      body,
      toneDescription: nuance,
      highlights: [`Adopted ${tone} tone version tailored for ${recipient}`],
      alternativeOpeners: [],
      toneUsed: tone,
      recipient,
      format,
      timestamp: Date.now(),
    };
    setCurrentDraft(newDraft);

    const newHistoryItem: HistoryItem = {
      id: 'hist_' + Date.now(),
      rawNotes,
      draft: newDraft,
      isStarred: false,
      createdAt: Date.now(),
    };
    setCurrentHistoryId(newHistoryItem.id);
    saveHistory([newHistoryItem, ...history.slice(0, 49)]);
  };

  const handleToggleStar = (id?: string) => {
    const targetId = id || currentHistoryId;
    if (!targetId) return;

    saveHistory(
      history.map((item) =>
        item.id === targetId ? { ...item, isStarred: !item.isStarred } : item
      )
    );
  };

  const isCurrentDraftStarred = () => {
    if (!currentHistoryId) return false;
    const item = history.find((h) => h.id === currentHistoryId);
    return !!item?.isStarred;
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setRawNotes(item.rawNotes);
    setSelectedTone(item.draft.toneUsed);
    setRecipient(item.draft.recipient);
    setFormat(item.draft.format);
    setCurrentDraft(item.draft);
    setCurrentHistoryId(item.id);
  };

  const handleReset = () => {
    setRawNotes('');
    setCurrentDraft(null);
    setCurrentHistoryId(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onReset={handleReset}
        hasInput={Boolean(rawNotes || currentDraft)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Tagline for First Impression */}
        {!currentDraft && (
          <div className="mb-6 text-center max-w-2xl mx-auto py-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Draft with intention. Rephrase with confidence.
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Pour out rough notes, pick your tone (
              <span className="font-semibold text-slate-800">Formal</span>,{' '}
              <span className="font-semibold text-emerald-700">Friendly</span>, or{' '}
              <span className="font-semibold text-indigo-700">Firm</span>), specify the recipient, and let Gemini draft the perfect message.
            </p>
          </div>
        )}

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Configuration & Raw Notes */}
          <section className={`lg:col-span-6 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs transition-all ${
            currentDraft ? '' : 'lg:col-span-8 lg:col-start-3'
          }`}>
            {/* Tone Selector with Formal, Friendly, Firm */}
            <ToneSelector
              selectedTone={selectedTone}
              onChangeTone={(tone) => setSelectedTone(tone)}
            />

            {/* Recipient Field */}
            <RecipientSelector
              recipient={recipient}
              onChangeRecipient={(val) => setRecipient(val)}
            />

            {/* Raw Thought Text Area & Generate Button */}
            <NotesInput
              rawNotes={rawNotes}
              onChangeRawNotes={(val) => setRawNotes(val)}
              format={format}
              onChangeFormat={(val) => setFormat(val)}
              length={length}
              onChangeLength={(val) => setLength(val)}
              onGenerate={handleGenerate}
              onCompareTones={handleCompareTones}
              isGenerating={isGenerating}
              isComparing={isComparing}
            />
          </section>

          {/* Right Column: Draft Output & Refinements */}
          {currentDraft ? (
            <section className="lg:col-span-6 space-y-4">
              <DraftOutput
                draft={currentDraft}
                onRefineDraft={handleRefineDraft}
                isRefining={isRefining}
                onToggleStar={() => handleToggleStar()}
                isStarred={isCurrentDraftStarred()}
                onUpdateDraftBody={handleUpdateDraftBody}
              />
            </section>
          ) : (
            // Placeholder hint when in 2-column view (desktop) if wider
            null
          )}
        </div>
      </main>

      {/* Compare Modal (Formal vs Friendly vs Firm side-by-side) */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparison={comparisonData}
        recipient={recipient}
        onSelectToneDraft={handleSelectToneFromCompare}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelect={handleLoadHistoryItem}
        onToggleStar={handleToggleStar}
        onClearHistory={() => saveHistory([])}
      />
    </div>
  );
}
