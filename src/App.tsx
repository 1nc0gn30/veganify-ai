import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Camera,
  Check,
  Coffee,
  Copy,
  ExternalLink,
  Leaf,
  Utensils,
} from 'lucide-react';
import { ConverterWorkspace } from './components/ConverterWorkspace';
import { SubstitutionGuide } from './components/SubstitutionGuide';
import { CookbookView } from './components/CookbookView';
import { VisionByokView } from './components/VisionByokView';
import { TransformedRecipe } from './lib/converter';
import { PromptVibe } from './lib/ai';
import {
  clearCookbook,
  loadSavedCookbook,
  removeRecipeFromCookbook,
  SavedRecipeEntry,
  saveRecipeToCookbook,
} from './lib/storage';

type TabId = 'converter' | 'matrix' | 'cookbook' | 'vision';

const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_TIP_ADDRESS = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('converter');
  const [cookbook, setCookbook] = useState<SavedRecipeEntry[]>(() => loadSavedCookbook());
  const [solCopied, setSolCopied] = useState(false);

  const savedIds = useMemo(() => {
    const set = new Set<string>();
    for (const item of cookbook) {
      set.add(
        `${item.veganTitle}-${item.filters.soyFree}-${item.filters.nutFree}-${item.filters.glutenFree}`
      );
    }
    return set;
  }, [cookbook]);

  const handleSaveOfflineRecipe = (recipe: TransformedRecipe) => {
    const id = `${recipe.veganTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${recipe.filters.soyFree ? 'sf' : ''}${recipe.filters.nutFree ? 'nf' : ''}${recipe.filters.glutenFree ? 'gf' : ''}-${Date.now()}`;
    const entry: SavedRecipeEntry = {
      id,
      savedAt: Date.now(),
      source: 'offline',
      originalTitle: recipe.originalTitle,
      veganTitle: recipe.veganTitle,
      servings: recipe.servings,
      vibe: recipe.vibe,
      filters: recipe.filters,
      animalCount: recipe.animalCount,
      totalIngredients: recipe.totalIngredients,
      markdown: recipe.markdown,
      recipeData: recipe,
    };
    setCookbook(saveRecipeToCookbook(entry));
  };

  const handleSaveVisionRecipe = (
    markdown: string,
    imagePreview: string,
    vibe: PromptVibe
  ) => {
    const titleMatch = markdown.match(/#+\s*(.+)/);
    const veganTitle = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : 'Photo Vision Recipe';
    const entry: SavedRecipeEntry = {
      id: `vision-${Date.now()}`,
      savedAt: Date.now(),
      source: 'vision-byok',
      originalTitle: 'Uploaded Dish Photo',
      veganTitle,
      servings: 4,
      vibe,
      filters: { soyFree: false, nutFree: false, glutenFree: false },
      animalCount: 0,
      totalIngredients: 0,
      markdown,
      imagePreview,
    };
    setCookbook(saveRecipeToCookbook(entry));
  };

  const handleDeleteSaved = (id: string) => {
    setCookbook(removeRecipeFromCookbook(id));
  };

  const handleClearAll = () => {
    clearCookbook();
    setCookbook([]);
  };

  const copySolana = async () => {
    try {
      await navigator.clipboard.writeText(SOLANA_TIP_ADDRESS);
      setSolCopied(true);
      setTimeout(() => setSolCopied(false), 1800);
    } catch {
      setSolCopied(false);
    }
  };

  const navItems: Array<{ id: TabId; label: string; mobileLabel: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'converter', label: 'Converter', mobileLabel: 'Convert', icon: <Utensils size={16} /> },
    { id: 'matrix', label: 'Swap Matrix', mobileLabel: 'Matrix', icon: <BookOpen size={16} /> },
    {
      id: 'cookbook',
      label: 'Cookbook',
      mobileLabel: 'Saved',
      icon: <BookMarked size={16} />,
      badge: cookbook.length > 0 ? cookbook.length : undefined,
    },
    { id: 'vision', label: 'Photo BYOK', mobileLabel: 'Vision', icon: <Camera size={16} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 botanical-paper-grid text-ink-950 selection:bg-botanical-100">
      {/* Top Header */}
      <header className="no-print sticky top-0 z-40 bg-paper-50/92 backdrop-blur-md border-b border-paper-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[64px] py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('converter')}
              className="flex items-center gap-2.5 text-left cursor-pointer"
            >
              <span className="w-9 h-9 rounded-xl bg-botanical-600 text-white flex items-center justify-center shrink-0">
                <Leaf size={19} />
              </span>
              <span className="flex flex-col">
                <span className="font-display font-bold text-lg leading-none tracking-tight text-ink-950">
                  Veganify<span className="text-botanical-600">AI</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mt-0.5">
                  v2.0 · Open Culinary Engine
                </span>
              </span>
            </button>
          </div>

          {/* Primary Navigation */}
          <nav aria-label="Primary navigation" className="grid grid-cols-4 sm:flex items-center gap-1 w-full sm:w-auto">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveTab(item.id)}
                  className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-botanical-600 text-white'
                      : 'text-ink-700 hover:bg-paper-100 hover:text-ink-950'
                  }`}
                >
                  {item.icon}
                  <span className="sm:hidden">{item.mobileLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-botanical-800 text-botanical-100' : 'bg-paper-200 text-ink-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Subtle Open-Access Coffee Link (Desktop >= 1024px) */}
          <a
            href={STRIPE_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-paper-200 hover:border-botanical-600 text-xs font-medium text-ink-800 items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Coffee size={14} className="text-saffron-700" />
            Buy Us a Coffee
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-7 sm:py-10">
        {activeTab === 'converter' && (
          <ConverterWorkspace
            onSaveRecipe={handleSaveOfflineRecipe}
            onOpenVision={() => setActiveTab('vision')}
            savedIds={savedIds}
          />
        )}
        {activeTab === 'matrix' && <SubstitutionGuide />}
        {activeTab === 'cookbook' && (
          <CookbookView
            entries={cookbook}
            onDelete={handleDeleteSaved}
            onGoToConverter={() => setActiveTab('converter')}
          />
        )}
        {activeTab === 'vision' && (
          <VisionByokView
            onSaveVisionRecipe={handleSaveVisionRecipe}
            onClearAllData={handleClearAll}
          />
        )}
      </main>

      {/* Clean Attribution & Open Support Footer (Always Visible on All Viewports) */}
      <footer className="no-print border-t border-paper-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-ink-950">
                Engineered by{' '}
                <a
                  href="https://github.com/1nc0gn30/veganify-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-botanical-700 hover:underline"
                >
                  Neal Frazier Tech (@1nc0gn30)
                </a>{' '}
                •{' '}
                <a
                  href="https://nullai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-botanical-700 hover:underline"
                >
                  NullAI Platform
                </a>
              </p>
              <p className="text-xs text-ink-500">
                100% free, open-source, and unlocked by default. Runs offline in your browser with zero paywalls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={STRIPE_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-saffron-50 border border-saffron-200 hover:bg-saffron-200/50 text-saffron-700 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Coffee size={15} />
                Buy Us a Coffee
                <ExternalLink size={13} />
              </a>

              <div className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-xl bg-paper-50 border border-paper-200">
                <a
                  href={`solana:${SOLANA_TIP_ADDRESS}`}
                  className="font-mono text-[11px] text-ink-700 hover:text-botanical-700"
                  title={`Solana Tip Address: ${SOLANA_TIP_ADDRESS}`}
                >
                  SOL: {SOLANA_TIP_ADDRESS.slice(0, 6)}...{SOLANA_TIP_ADDRESS.slice(-6)}
                </a>
                <button
                  type="button"
                  onClick={() => void copySolana()}
                  aria-label="Copy Solana tip address"
                  className="p-1.5 rounded-lg text-ink-600 hover:bg-paper-200 transition-colors cursor-pointer"
                >
                  {solCopied ? <Check size={13} className="text-botanical-600" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-paper-100 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
            <span>Culinary substitution data & ratios are for educational kitchen reference. Verify packaged labels for severe allergies.</span>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/1nc0gn30/veganify-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-botanical-700 transition-colors"
              >
                GitHub Source
              </a>
              <a
                href="https://nullai.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-botanical-700 transition-colors"
              >
                NullAI Platform
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
