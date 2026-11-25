import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  Check,
  Clock,
  Copy,
  Download,
  Printer,
  Search,
  Trash2,
  Utensils,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { downloadMarkdownFile, SavedRecipeEntry } from '../lib/storage';

interface CookbookViewProps {
  entries: SavedRecipeEntry[];
  onDelete: (id: string) => void;
  onGoToConverter: () => void;
}

export const CookbookView: React.FC<CookbookViewProps> = ({
  entries,
  onDelete,
  onGoToConverter,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(entries[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((item) =>
      `${item.veganTitle} ${item.originalTitle} ${item.markdown}`.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const activeEntry =
    filtered.find((e) => e.id === selectedId) || filtered[0] || null;

  const handleCopy = async (entry: SavedRecipeEntry) => {
    try {
      await navigator.clipboard.writeText(entry.markdown);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-paper-200">
        <div className="space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-botanical-700">
            Local Browser Cookbook · Zero Cloud Storage
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink-950">
            Saved Plant-Based Cookbook
          </h1>
          <p className="text-sm sm:text-base text-ink-600 max-w-[60ch]">
            All converted recipes stay locally in your browser&apos;s storage. Export any saved dish as Markdown or print a kitchen card.
          </p>
        </div>
        <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-white border border-paper-200 text-ink-700 self-start sm:self-auto">
          {entries.length} saved recipe{entries.length === 1 ? '' : 's'}
        </span>
      </section>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-paper-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-botanical-50 text-botanical-700 flex items-center justify-center mx-auto">
            <BookMarked size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-display font-semibold text-ink-950">
              Your cookbook is empty
            </h2>
            <p className="text-sm text-ink-600 max-w-md mx-auto">
              Convert any classic dish or custom ingredient list in the Recipe Converter and click &ldquo;Save Recipe&rdquo; to build your offline collection.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToConverter}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Utensils size={16} />
            Open Recipe Converter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar List */}
          <aside className="no-print lg:col-span-4 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved recipes..."
                aria-label="Search saved recipes"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((item) => {
                const isSelected = activeEntry?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3.5 transition-colors ${
                      isSelected
                        ? 'bg-botanical-50/70 border-botanical-600'
                        : 'bg-white border-paper-200 hover:border-botanical-600/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="text-left flex-1 min-w-0 space-y-1 cursor-pointer"
                      >
                        <h3 className="text-sm font-semibold text-ink-950 truncate">
                          {item.veganTitle}
                        </h3>
                        <p className="text-xs text-ink-500 flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(item.savedAt).toLocaleDateString()} · {item.servings} servings
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete ${item.veganTitle}`}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-ink-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Active Recipe Reader */}
          {activeEntry && (
            <article className="print-card lg:col-span-8 bg-white rounded-2xl border border-paper-200 p-5 sm:p-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-paper-200">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-paper-100 text-ink-700">
                    {activeEntry.source === 'vision-byok' ? 'BYOK Photo Vision' : 'Offline Engine'}
                  </span>
                  <h2 className="text-2xl font-display font-semibold text-ink-950 mt-1">
                    {activeEntry.veganTitle}
                  </h2>
                </div>
                <div className="no-print flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopy(activeEntry)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-200 hover:bg-paper-100 text-sm font-medium text-ink-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === activeEntry.id ? (
                      <Check size={15} className="text-botanical-600" />
                    ) : (
                      <Copy size={15} />
                    )}
                    {copiedId === activeEntry.id ? 'Copied' : 'Copy .md'}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadMarkdownFile(activeEntry.veganTitle, activeEntry.markdown)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-200 hover:bg-paper-100 text-sm font-medium text-ink-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={15} />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-200 hover:bg-paper-100 text-sm font-medium text-ink-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} />
                    Print
                  </button>
                </div>
              </div>

              {activeEntry.imagePreview && (
                <div className="max-h-72 rounded-xl overflow-hidden border border-paper-200">
                  <img
                    src={activeEntry.imagePreview}
                    alt={`Dish photo for ${activeEntry.veganTitle}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="markdown-body max-w-none text-sm">
                <Markdown>{activeEntry.markdown}</Markdown>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
};
