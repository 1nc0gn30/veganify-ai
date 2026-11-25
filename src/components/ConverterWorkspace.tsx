import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  BookmarkCheck,
  BookmarkPlus,
  Camera,
  Check,
  CheckSquare,
  ChefHat,
  Copy,
  Download,
  Flame,
  FlaskConical,
  Printer,
  RotateCcw,
  ShieldCheck,
  Square,
  Utensils,
} from 'lucide-react';
import { CLASSIC_DISHES, ClassicDish } from '../data/classicDishes';
import { AllergenFilters, CHEMISTRY_ROLE_LABELS } from '../data/substitutions';
import { CookingVibe, TransformedRecipe, transformRecipe } from '../lib/converter';
import { downloadMarkdownFile } from '../lib/storage';

interface ConverterWorkspaceProps {
  onSaveRecipe: (recipe: TransformedRecipe) => void;
  onOpenVision: () => void;
  savedIds: Set<string>;
}

const VIBE_OPTIONS: Array<{ value: CookingVibe; label: string }> = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'high-protein', label: 'High-Protein' },
  { value: 'quick', label: 'Quick Weeknight' },
  { value: 'chef', label: 'Chef Technique' },
];

const SCALE_OPTIONS = [0.5, 1, 2, 3];

export const ConverterWorkspace: React.FC<ConverterWorkspaceProps> = ({
  onSaveRecipe,
  onOpenVision,
  savedIds,
}) => {
  const initialDish = CLASSIC_DISHES[0];

  const [activeDishId, setActiveDishId] = useState<string>(initialDish.id);
  const [title, setTitle] = useState<string>(initialDish.name);
  const [servings, setServings] = useState<number>(initialDish.servings);
  const [scale, setScale] = useState<number>(1);
  const [rawIngredients, setRawIngredients] = useState<string>(initialDish.ingredients.join('\n'));
  const [rawSteps, setRawSteps] = useState<string>(initialDish.steps.join('\n'));
  const [filters, setFilters] = useState<AllergenFilters>({
    soyFree: false,
    nutFree: false,
    glutenFree: false,
  });
  const [vibe, setVibe] = useState<CookingVibe>('balanced');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showMethodEditor, setShowMethodEditor] = useState(false);

  const result = useMemo(
    () =>
      transformRecipe({
        title,
        servings,
        scale,
        rawIngredients,
        rawSteps,
        filters,
        vibe,
      }),
    [title, servings, scale, rawIngredients, rawSteps, filters, vibe]
  );

  const loadClassicDish = (dish: ClassicDish) => {
    setActiveDishId(dish.id);
    setTitle(dish.name);
    setServings(dish.servings);
    setScale(1);
    setRawIngredients(dish.ingredients.join('\n'));
    setRawSteps(dish.steps.join('\n'));
    setCheckedIngredients({});
    setJustSaved(false);
  };

  const handleClearCustom = () => {
    setActiveDishId('custom');
    setTitle('My Custom Dish');
    setServings(4);
    setScale(1);
    setRawIngredients(
      '1 lb chicken breast, cubed\n2 tbsp unsalted butter\n1 cup heavy cream\n1/2 cup grated parmesan cheese\n1 cup chicken broth\n3 cloves garlic, minced\n1 tsp sea salt'
    );
    setRawSteps('');
    setCheckedIngredients({});
    setJustSaved(false);
  };

  const toggleFilter = (key: keyof AllergenFilters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setJustSaved(false);
  };

  const toggleChecked = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback textarea copy
      const el = document.createElement('textarea');
      el.value = result.markdown;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleSave = () => {
    onSaveRecipe(result);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  const signatureKey = `${result.veganTitle}-${result.filters.soyFree}-${result.filters.nutFree}-${result.filters.glutenFree}`;
  const isAlreadySaved = savedIds.has(signatureKey) || justSaved;

  const hasTechAdjustments =
    result.techniquePlan.moisture.length > 0 ||
    result.techniquePlan.fat.length > 0 ||
    result.techniquePlan.umami.length > 0 ||
    result.techniquePlan.maillard.length > 0;

  return (
    <div className="space-y-8">
      {/* Compact Editorial Intro Bar */}
      <section className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-paper-200">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-botanical-700">
            <span className="inline-block w-2 h-2 rounded-full bg-botanical-600" />
            Offline Culinary Chemistry Engine · 65 Verified Swaps
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold tracking-tight text-ink-950 leading-[1.1]">
            Convert any dish into plant-based chemistry.
          </h1>
          <p className="text-sm sm:text-base text-ink-600 leading-relaxed max-w-[62ch]">
            Pick a classic dish or paste any ingredient list below. The engine calculates exact plant ratios, allergen-safe swaps, and technique adjustments locally in your browser with zero API keys required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenVision}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-paper-200 hover:border-botanical-600 text-ink-800 text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Camera size={16} className="text-botanical-600" />
            Photo Vision (Optional BYOK)
          </button>
        </div>
      </section>

      {/* Classic Dish Quick-Load Strip */}
      <section className="no-print space-y-2.5" aria-label="Classic non-vegan dish presets">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Classic Dish Presets ({CLASSIC_DISHES.length})
          </span>
          <button
            type="button"
            onClick={handleClearCustom}
            className="text-xs font-medium text-botanical-700 hover:text-botanical-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw size={13} />
            Custom template
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CLASSIC_DISHES.map((dish) => {
            const active = activeDishId === dish.id;
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => loadClassicDish(dish)}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                  active
                    ? 'bg-botanical-600 text-white border-botanical-700 shadow-xs'
                    : 'bg-white text-ink-800 border-paper-200 hover:border-botanical-600 hover:bg-botanical-50/40'
                }`}
              >
                {dish.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Recipe Input & Allergen Controls */}
        <section
          aria-label="Original recipe input"
          className="no-print lg:col-span-5 bg-white rounded-2xl border border-paper-200 p-5 sm:p-6 space-y-5 shadow-[0_1px_2px_rgba(22,27,23,0.04)]"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-paper-100">
            <div className="flex items-center gap-2">
              <Utensils size={18} className="text-botanical-600" />
              <h2 className="text-lg font-display font-semibold text-ink-950">Source Recipe</h2>
            </div>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-paper-100 text-ink-600">
              Live Conversion
            </span>
          </div>

          {/* Dish Name + Servings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="dish-title" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Dish Name
              </label>
              <input
                id="dish-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setActiveDishId('custom');
                }}
                placeholder="e.g. Classic Beef Stroganoff"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dish-servings" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Base Servings
              </label>
              <input
                id="dish-servings"
                type="number"
                min={1}
                max={48}
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm font-mono text-ink-950 focus:outline-none focus:border-botanical-600"
              />
            </div>
          </div>

          {/* Allergen-Free Toggles */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Allergen Constraints (Dynamic Swap Routing)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'soyFree', label: 'Soy-Free' },
                  { key: 'nutFree', label: 'Nut-Free' },
                  { key: 'glutenFree', label: 'Gluten-Free' },
                ] as const
              ).map(({ key, label }) => {
                const enabled = filters[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => toggleFilter(key)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      enabled
                        ? 'bg-botanical-600 text-white border-botanical-700'
                        : 'bg-paper-50 text-ink-800 border-paper-200 hover:border-botanical-600'
                    }`}
                  >
                    <ShieldCheck size={14} className={enabled ? 'text-botanical-100' : 'text-ink-500'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale + Cooking Vibe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Batch Scale
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {SCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setScale(opt)}
                    className={`min-h-[44px] rounded-xl font-mono text-xs font-semibold border transition-colors cursor-pointer ${
                      scale === opt
                        ? 'bg-ink-950 text-white border-ink-950'
                        : 'bg-paper-50 text-ink-800 border-paper-200 hover:border-ink-600'
                    }`}
                  >
                    {opt}×
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cooking-vibe" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                Culinary Focus
              </label>
              <select
                id="cooking-vibe"
                value={vibe}
                onChange={(e) => setVibe(e.target.value as CookingVibe)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
              >
                {VIBE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ingredients Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="raw-ingredients" className="text-xs font-semibold uppercase tracking-wider text-ink-600">
                Ingredients (one per line)
              </label>
              <span className="font-mono text-[11px] text-ink-500">
                {result.totalIngredients} lines · {result.animalCount} swapped
              </span>
            </div>
            <textarea
              id="raw-ingredients"
              rows={9}
              value={rawIngredients}
              onChange={(e) => {
                setRawIngredients(e.target.value);
                setActiveDishId('custom');
              }}
              placeholder="Paste ingredients with quantities, e.g.&#10;4 large egg yolks&#10;1 cup heavy cream&#10;1 lb ground beef"
              className="w-full p-3.5 rounded-xl bg-paper-50 border border-paper-200 text-sm font-mono leading-relaxed text-ink-950 focus:outline-none focus:border-botanical-600 resize-y"
            />
          </div>

          {/* Optional Method Steps Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMethodEditor((s) => !s)}
              className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-xs font-semibold uppercase tracking-wider text-ink-700 flex items-center justify-between hover:border-botanical-600 transition-colors cursor-pointer"
            >
              <span>Original Method Steps (Optional)</span>
              <span className="font-mono text-botanical-700">
                {showMethodEditor ? 'Hide' : rawSteps.trim() ? 'Edit steps' : 'Add steps'}
              </span>
            </button>
            {showMethodEditor && (
              <textarea
                aria-label="Original recipe method steps"
                rows={6}
                value={rawSteps}
                onChange={(e) => setRawSteps(e.target.value)}
                placeholder="Paste original cooking steps (one per line). Leave blank to auto-generate a plant-based technique workflow."
                className="mt-2 w-full p-3.5 rounded-xl bg-paper-50 border border-paper-200 text-sm leading-relaxed text-ink-950 focus:outline-none focus:border-botanical-600 resize-y"
              />
            )}
          </div>
        </section>

        {/* RIGHT PANE: Converted Plant-Based Recipe Card */}
        <section
          aria-label="Converted plant-based recipe output"
          className="print-card lg:col-span-7 bg-white rounded-2xl border border-paper-200 p-5 sm:p-7 space-y-7 shadow-[0_1px_2px_rgba(22,27,23,0.04)]"
        >
          {/* Output Header & Action Bar */}
          <div className="space-y-4 pb-5 border-b border-paper-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-botanical-50 text-botanical-800 border border-botanical-200 font-mono text-[11px] font-semibold uppercase tracking-wider">
                100% Plant-Based
              </span>
              {result.filters.soyFree && (
                <span className="px-2.5 py-1 rounded-md bg-paper-100 text-ink-800 font-mono text-[11px] font-medium">
                  Soy-Free
                </span>
              )}
              {result.filters.nutFree && (
                <span className="px-2.5 py-1 rounded-md bg-paper-100 text-ink-800 font-mono text-[11px] font-medium">
                  Nut-Free
                </span>
              )}
              {result.filters.glutenFree && (
                <span className="px-2.5 py-1 rounded-md bg-paper-100 text-ink-800 font-mono text-[11px] font-medium">
                  Gluten-Free
                </span>
              )}
              <span className="ml-auto font-mono text-xs text-ink-500">
                {result.servings} servings · {result.animalCount} swap{result.animalCount === 1 ? '' : 's'} applied
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ink-950 leading-tight">
                {result.veganTitle}
              </h2>
              <p className="text-xs sm:text-sm text-ink-500">
                Converted from <span className="font-medium text-ink-800">{result.originalTitle}</span> · Style:{' '}
                <span className="capitalize font-medium text-ink-800">{result.vibe}</span>
              </p>
            </div>

            <div className="no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                {isAlreadySaved ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
                {justSaved ? 'Saved' : 'Save Recipe'}
              </button>
              <button
                type="button"
                onClick={() => void handleCopyMarkdown()}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-paper-50 hover:bg-paper-100 border border-paper-200 text-ink-800 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                {copied ? <Check size={15} className="text-botanical-600" /> : <Copy size={15} />}
                {copied ? 'Copied .md' : 'Copy .md'}
              </button>
              <button
                type="button"
                onClick={() => downloadMarkdownFile(result.veganTitle, result.markdown)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-paper-50 hover:bg-paper-100 border border-paper-200 text-ink-800 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Download size={15} />
                Download .md
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-paper-50 hover:bg-paper-100 border border-paper-200 text-ink-800 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Printer size={15} />
                Print Card
              </button>
            </div>
          </div>

          {/* Plant-Based Ingredient Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-ink-950">
                Plant-Based Ingredients
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Tap to check off
              </span>
            </div>
            <ul className="divide-y divide-paper-100 border border-paper-200 rounded-xl overflow-hidden">
              {result.ingredients.map((item) => {
                const done = !!checkedIngredients[item.id];
                return (
                  <li key={item.id} className={item.isAnimalDerived ? 'bg-botanical-50/35' : 'bg-white'}>
                    <button
                      type="button"
                      onClick={() => toggleChecked(item.id)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-paper-50/70 transition-colors cursor-pointer"
                    >
                      <span className="mt-0.5 text-botanical-600 shrink-0">
                        {done ? <CheckSquare size={17} /> : <Square size={17} className="text-ink-500" />}
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-ink-500' : 'text-ink-950'}`}>
                          {item.convertedLine}
                        </p>
                        {item.isAnimalDerived && item.chosenSwap && (
                          <p className="text-xs text-ink-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="inline-flex items-center gap-1 text-botanical-700 font-medium">
                              <ArrowRightLeft size={11} />
                              replaces {item.originalLine}
                            </span>
                            <span className="font-mono text-[11px] text-ink-500">
                              [{item.chosenSwap.ratio}]
                            </span>
                            {item.allergenAdjusted && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-saffron-50 text-saffron-700 border border-saffron-200">
                                Allergen-adapted
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Substitution Chemistry Ledger */}
          {result.substitutionsUsed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical size={18} className="text-saffron-700" />
                <h3 className="text-lg font-display font-semibold text-ink-950">
                  Culinary Chemistry Ledger
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {result.substitutionsUsed.map(({ entry, chosenSwap, allergenAdjusted }) => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-paper-200 bg-paper-50/60 p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-ink-950">
                        {entry.name} <span className="text-ink-500 font-normal">→</span>{' '}
                        <span className="text-botanical-700">{chosenSwap.ingredient}</span>
                      </h4>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-paper-200 text-ink-700">
                        Ratio: {chosenSwap.ratio}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                      <strong className="text-ink-800">Why it works:</strong> {entry.chemistryNote}
                    </p>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      <strong className="text-ink-800">Prep tip:</strong> {chosenSwap.prepTip}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {entry.chemistryRoles.map((role) => (
                        <span
                          key={role}
                          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-paper-200 text-ink-600"
                        >
                          {CHEMISTRY_ROLE_LABELS[role]}
                        </span>
                      ))}
                      {allergenAdjusted && (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-saffron-50 text-saffron-700 border border-saffron-200">
                          Allergen-safe route
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Technique Adjustments */}
          {hasTechAdjustments && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-saffron-700" />
                <h3 className="text-lg font-display font-semibold text-ink-950">
                  Technique & Flavor Adjustments
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Moisture Control', items: result.techniquePlan.moisture },
                  { label: 'Fat & Emulsion', items: result.techniquePlan.fat },
                  { label: 'Umami Layering', items: result.techniquePlan.umami },
                  { label: 'Maillard Browning', items: result.techniquePlan.maillard },
                ]
                  .filter((group) => group.items.length > 0)
                  .map((group) => (
                    <div
                      key={group.label}
                      className="rounded-xl border border-paper-200 bg-white p-3.5 space-y-1.5"
                    >
                      <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-saffron-700 font-semibold">
                        {group.label}
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-ink-700 leading-relaxed">
                        {group.items.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Plant-Based Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ChefHat size={18} className="text-botanical-600" />
              <h3 className="text-lg font-display font-semibold text-ink-950">
                Step-by-Step Plant-Based Method
              </h3>
            </div>
            <ol className="space-y-3">
              {result.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-paper-50/70 border border-paper-100"
                >
                  <span className="w-6 h-6 rounded-full bg-botanical-600 text-white font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-ink-800 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Culinary Style Tips */}
          {result.vibeTips.length > 0 && (
            <div className="rounded-xl bg-botanical-50/60 border border-botanical-200 p-4 space-y-2">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-botanical-800 font-semibold">
                {result.vibe} Mode Notes
              </h4>
              <ul className="space-y-1 text-xs sm:text-sm text-ink-800 list-disc pl-4">
                {result.vibeTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
