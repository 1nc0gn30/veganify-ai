import React, { useMemo, useState } from 'react';
import {
  Calculator,
  FlaskConical,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  AllergenFilters,
  CATEGORY_META,
  CHEMISTRY_ROLE_LABELS,
  ChemistryRole,
  SUBSTITUTION_MATRIX,
  SubstitutionCategory,
} from '../data/substitutions';
import { formatCulinaryNumber, selectCompliantSwap } from '../lib/converter';

const ALL_CATEGORIES: Array<{ id: 'all' | SubstitutionCategory; label: string }> = [
  { id: 'all', label: `All (${SUBSTITUTION_MATRIX.length})` },
  { id: 'dairy', label: CATEGORY_META.dairy.shortLabel },
  { id: 'eggs-baking', label: CATEGORY_META['eggs-baking'].shortLabel },
  { id: 'meat-poultry', label: CATEGORY_META['meat-poultry'].shortLabel },
  { id: 'seafood', label: CATEGORY_META.seafood.shortLabel },
  { id: 'stocks-sauces', label: CATEGORY_META['stocks-sauces'].shortLabel },
];

export const SubstitutionGuide: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | SubstitutionCategory>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | ChemistryRole>('all');
  const [filters, setFilters] = useState<AllergenFilters>({
    soyFree: false,
    nutFree: false,
    glutenFree: false,
  });

  // Pantry Swapper Calculator state
  const [calcEntryId, setCalcEntryId] = useState<string>('whole-egg');
  const [calcAmount, setCalcAmount] = useState<number>(2);
  const [calcUnit, setCalcUnit] = useState<string>('large');

  const selectedEntry = useMemo(
    () => SUBSTITUTION_MATRIX.find((e) => e.id === calcEntryId) || SUBSTITUTION_MATRIX[0],
    [calcEntryId]
  );

  const selectedSwapResult = useMemo(
    () => selectCompliantSwap(selectedEntry, filters),
    [selectedEntry, filters]
  );

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUBSTITUTION_MATRIX.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (roleFilter !== 'all' && !entry.chemistryRoles.includes(roleFilter)) return false;
      if (!q) return true;
      const haystack = [
        entry.name,
        ...entry.aliases,
        entry.primarySwap.ingredient,
        ...entry.alternatives.map((a) => a.ingredient),
        entry.chemistryNote,
        ...entry.flavorPairings,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category, roleFilter]);

  const toggleFilter = (key: keyof AllergenFilters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const calculatedQty = formatCulinaryNumber(
    Math.max(0.125, calcAmount || 1) * selectedSwapResult.swap.ratioMultiplier
  );
  const calculatedUnit = selectedSwapResult.swap.ratioUnitOverride || calcUnit;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-2 pb-5 border-b border-paper-200">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-botanical-700">
          Reference Matrix · {SUBSTITUTION_MATRIX.length} Animal-to-Plant Equivalencies
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink-950 leading-tight">
          Substitution Matrix & Pantry Swapper
        </h1>
        <p className="text-sm sm:text-base text-ink-600 max-w-[66ch]">
          Search every dairy, egg, meat, seafood, and stock swap by ingredient or culinary function. Toggle allergen filters to route every ratio automatically.
        </p>
      </section>

      {/* Interactive Pantry Swapper Calculator */}
      <section className="bg-white rounded-2xl border border-paper-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-botanical-600" />
          <h2 className="text-lg font-display font-semibold text-ink-950">
            Quick Pantry Ratio Calculator
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5 space-y-1.5">
            <label htmlFor="calc-ingredient" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Non-Vegan Ingredient
            </label>
            <select
              id="calc-ingredient"
              value={calcEntryId}
              onChange={(e) => {
                const nextId = e.target.value;
                setCalcEntryId(nextId);
                const nextEntry = SUBSTITUTION_MATRIX.find((x) => x.id === nextId);
                if (nextEntry?.category === 'eggs-baking') {
                  setCalcUnit('large');
                } else if (nextEntry?.category === 'dairy' || nextEntry?.category === 'stocks-sauces') {
                  setCalcUnit('cup');
                } else {
                  setCalcUnit('lb');
                }
              }}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
            >
              {SUBSTITUTION_MATRIX.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} ({CATEGORY_META[entry.category].shortLabel})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="calc-amount" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Quantity
            </label>
            <input
              id="calc-amount"
              type="number"
              step="0.25"
              min="0.25"
              max="50"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Math.max(0.25, parseFloat(e.target.value) || 0.25))}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm font-mono text-ink-950 focus:outline-none focus:border-botanical-600"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="calc-unit" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Unit
            </label>
            <select
              id="calc-unit"
              value={calcUnit}
              onChange={(e) => setCalcUnit(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
            >
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="oz">oz</option>
              <option value="lb">lb</option>
              <option value="g">g</option>
              <option value="large">large / unit</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <div className="min-h-[44px] px-3.5 py-2 rounded-xl bg-botanical-50 border border-botanical-200 flex flex-col justify-center">
              <span className="font-mono text-[10px] uppercase tracking-wider text-botanical-700">
                Exact Measure
              </span>
              <span className="font-mono text-sm font-semibold text-botanical-800">
                {calculatedQty} {calculatedUnit}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-paper-50 border border-paper-200 p-4 space-y-1.5">
          <p className="text-sm font-semibold text-ink-950">
            Use <span className="text-botanical-700">{calculatedQty} {calculatedUnit}</span> of{' '}
            <span className="text-botanical-700">{selectedSwapResult.swap.ingredient}</span>
          </p>
          <p className="text-xs sm:text-sm text-ink-600">{selectedSwapResult.swap.prepTip}</p>
          <p className="text-xs text-ink-500">
            <strong className="text-ink-700">Chemistry:</strong> {selectedEntry.chemistryNote}
          </p>
        </div>
      </section>

      {/* Search, Category, Role, and Allergen Filter Controls */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parmesan, egg yolk, bacon, clams, umami..."
              aria-label="Search substitution matrix"
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              aria-label="Filter by chemistry function"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | ChemistryRole)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
            >
              <option value="all">All Chemistry Functions</option>
              {Object.entries(CHEMISTRY_ROLE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  Function: {label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 grid grid-cols-3 gap-2">
            {(
              [
                { key: 'soyFree', label: 'Soy-Free' },
                { key: 'nutFree', label: 'Nut-Free' },
                { key: 'glutenFree', label: 'Gluten-Free' },
              ] as const
            ).map(({ key, label }) => {
              const active = filters[key];
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFilter(key)}
                  className={`min-h-[44px] px-2 py-2 rounded-xl border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    active
                      ? 'bg-botanical-600 text-white border-botanical-700'
                      : 'bg-white text-ink-800 border-paper-200 hover:border-botanical-600'
                  }`}
                >
                  <ShieldCheck size={13} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                category === cat.id
                  ? 'bg-ink-950 text-white border-ink-950'
                  : 'bg-white text-ink-800 border-paper-200 hover:border-ink-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Matrix Cards */}
      <div className="text-xs font-mono text-ink-500">
        Showing {filteredEntries.length} of {SUBSTITUTION_MATRIX.length} culinary swaps
      </div>

      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-paper-200 p-10 text-center space-y-2">
          <p className="font-display text-lg font-semibold text-ink-950">No matching substitutions found</p>
          <p className="text-sm text-ink-600">Try clearing your search term or selecting a broader chemistry role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const { swap, allergenAdjusted } = selectCompliantSwap(entry, filters);
            return (
              <article
                key={entry.id}
                className="bg-white rounded-2xl border border-paper-200 p-5 flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                        {CATEGORY_META[entry.category].shortLabel}
                      </span>
                      <h3 className="text-lg font-display font-semibold text-ink-950 leading-snug">
                        {entry.name}
                      </h3>
                    </div>
                    <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-paper-100 text-ink-800 shrink-0">
                      {swap.ratio}
                    </span>
                  </div>

                  <div className="rounded-xl bg-botanical-50/70 border border-botanical-200/80 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-botanical-800 font-semibold">
                        Recommended Swap
                      </span>
                      {allergenAdjusted && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-saffron-50 text-saffron-700 border border-saffron-200">
                          Allergen-adapted
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-ink-950">{swap.ingredient}</p>
                    <p className="text-xs text-ink-600 leading-relaxed">{swap.prepTip}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed flex items-start gap-2">
                    <FlaskConical size={14} className="text-saffron-700 shrink-0 mt-0.5" />
                    <span>{entry.chemistryNote}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-paper-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.chemistryRoles.map((role) => (
                      <span
                        key={role}
                        className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-paper-50 border border-paper-200 text-ink-600"
                      >
                        {CHEMISTRY_ROLE_LABELS[role]}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-ink-500">
                    Pairs with: <span className="text-ink-800">{entry.flavorPairings.slice(0, 3).join(', ')}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
