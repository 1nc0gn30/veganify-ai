import {
  AllergenFilters,
  AllergenKey,
  SUBSTITUTION_MATRIX,
  SubstitutionEntry,
  SwapOption,
} from '../data/substitutions';

export type CookingVibe = 'balanced' | 'comfort' | 'high-protein' | 'quick' | 'chef';

export interface ParsedIngredient {
  original: string;
  quantity: number | null;
  quantityRaw: string;
  unit: string;
  body: string;
  prepNote: string;
}

export interface ConvertedIngredient {
  id: string;
  originalLine: string;
  convertedLine: string;
  isAnimalDerived: boolean;
  alreadyPlantBased: boolean;
  substitution?: SubstitutionEntry;
  chosenSwap?: SwapOption;
  allergenAdjusted: boolean;
  scaledQuantityLabel?: string;
}

export interface TechniquePlan {
  moisture: string[];
  fat: string[];
  umami: string[];
  maillard: string[];
}

export interface TransformRecipeInput {
  title: string;
  servings: number;
  scale?: number;
  rawIngredients: string;
  rawSteps: string;
  filters: AllergenFilters;
  vibe: CookingVibe;
}

export interface TransformedRecipe {
  originalTitle: string;
  veganTitle: string;
  servings: number;
  scale: number;
  vibe: CookingVibe;
  filters: AllergenFilters;
  ingredients: ConvertedIngredient[];
  substitutionsUsed: Array<{
    entry: SubstitutionEntry;
    chosenSwap: SwapOption;
    allergenAdjusted: boolean;
    matchedOriginal: string;
  }>;
  techniquePlan: TechniquePlan;
  steps: string[];
  vibeTips: string[];
  animalCount: number;
  totalIngredients: number;
  markdown: string;
}

const UNICODE_FRACTIONS: Record<string, string> = {
  '¼': '1/4',
  '½': '1/2',
  '¾': '3/4',
  '⅓': '1/3',
  '⅔': '2/3',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
};

const KNOWN_UNITS = new Set([
  'cup', 'cups', 'c',
  'tbsp', 'tbs', 'tablespoon', 'tablespoons',
  'tsp', 'teaspoon', 'teaspoons',
  'oz', 'ounce', 'ounces',
  'lb', 'lbs', 'pound', 'pounds',
  'g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms',
  'ml', 'l', 'liter', 'liters',
  'clove', 'cloves', 'slice', 'slices', 'can', 'cans',
  'stick', 'sticks', 'head', 'heads', 'stalk', 'stalks',
  'sprig', 'sprigs', 'sheet', 'sheets', 'pinch', 'dash', 'bunch', 'handful',
]);

// Qualifiers that indicate an ingredient is ALREADY plant-based so we never double-swap it.
const ALREADY_VEGAN_PATTERN =
  /\b(vegan|plant-based|plant based|dairy-free|dairy free|oat milk|soy milk|almond milk|coconut milk|coconut cream|cashew milk|cashew cream|pea milk|hemp milk|rice milk|tofu|tempeh|seitan|aquafaba|flax egg|nutritional yeast|olive oil|avocado oil|coconut oil|sesame oil|peanut butter|almond butter|cashew butter|sunflower butter|cocoa butter|apple butter|butternut|eggplant|aubergine|cream of tartar|coconut yogurt|oat yogurt|soy yogurt|vegan butter|vegan cheese|vegan mayo|vegetable broth|mushroom broth|kombu|nori)\b/i;

export function normalizeFractions(input: string): string {
  let out = input;
  for (const [char, frac] of Object.entries(UNICODE_FRACTIONS)) {
    out = out.replaceAll(char, ` ${frac}`);
  }
  return out.replace(/\s+/g, ' ').trim();
}

export function parseNumericValue(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // Handle range like "2-3" by taking the upper/average? Take first for deterministic scaling, or midpoint
  if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(cleaned)) {
    const [a, b] = cleaned.split('-').map((n) => parseFloat(n.trim()));
    if (!Number.isNaN(a) && !Number.isNaN(b)) {
      return (a + b) / 2;
    }
  }

  // Mixed number e.g. "1 1/2"
  const mixed = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const num = parseInt(mixed[2], 10);
    const den = parseInt(mixed[3], 10);
    return den !== 0 ? whole + num / den : whole;
  }

  // Simple fraction e.g. "3/4"
  const frac = cleaned.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const num = parseInt(frac[1], 10);
    const den = parseInt(frac[2], 10);
    return den !== 0 ? num / den : null;
  }

  const dec = parseFloat(cleaned);
  return Number.isNaN(dec) ? null : dec;
}

export function formatCulinaryNumber(value: number): string {
  if (value <= 0) return '0';
  const whole = Math.floor(value + 1e-6);
  const rem = value - whole;

  const fractionTable: Array<[number, string]> = [
    [0, ''],
    [1 / 8, '1/8'],
    [1 / 4, '1/4'],
    [1 / 3, '1/3'],
    [3 / 8, '3/8'],
    [1 / 2, '1/2'],
    [5 / 8, '5/8'],
    [2 / 3, '2/3'],
    [3 / 4, '3/4'],
    [7 / 8, '7/8'],
    [1, '1'],
  ];

  let bestFrac = '';
  let minDiff = Infinity;
  for (const [fVal, label] of fractionTable) {
    const diff = Math.abs(rem - fVal);
    if (diff < minDiff) {
      minDiff = diff;
      bestFrac = label;
    }
  }

  if (minDiff <= 0.045) {
    if (bestFrac === '1') return String(whole + 1);
    if (whole === 0 && bestFrac) return bestFrac;
    if (whole > 0 && bestFrac) return `${whole} ${bestFrac}`;
    return String(whole);
  }

  return Number(value.toFixed(2)).toString();
}

export function parseIngredientLine(rawLine: string): ParsedIngredient {
  const cleaned = normalizeFractions(rawLine.replace(/^[-•*]\s*/, ''));
  const qtyRegex = /^((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?))\s+(.*)$/;
  const match = cleaned.match(qtyRegex);

  let quantity: number | null = null;
  let quantityRaw = '';
  let rest = cleaned;

  if (match) {
    quantityRaw = match[1].trim();
    quantity = parseNumericValue(quantityRaw);
    rest = match[2].trim();
  }

  const tokens = rest.split(/\s+/);
  let unit = '';
  let bodyWithPrep = rest;

  if (tokens.length > 1) {
    const candidate = tokens[0].toLowerCase().replace(/\.$/, '');
    if (KNOWN_UNITS.has(candidate)) {
      unit = tokens[0];
      bodyWithPrep = tokens.slice(1).join(' ');
    }
  }

  const commaIdx = bodyWithPrep.indexOf(',');
  let body = bodyWithPrep;
  let prepNote = '';
  if (commaIdx !== -1) {
    body = bodyWithPrep.slice(0, commaIdx).trim();
    prepNote = bodyWithPrep.slice(commaIdx + 1).trim();
  }

  return {
    original: rawLine.trim(),
    quantity,
    quantityRaw,
    unit,
    body,
    prepNote,
  };
}

// Pre-sort aliases longest-first across the entire matrix so specific terms match before generic terms
// e.g. "chicken broth" matches before "chicken", "heavy cream" before "cream", "egg yolks" before "egg".
const SORTED_MATCH_INDEX: Array<{ alias: string; regex: RegExp; entry: SubstitutionEntry }> = (() => {
  const list: Array<{ alias: string; regex: RegExp; entry: SubstitutionEntry }> = [];
  for (const entry of SUBSTITUTION_MATRIX) {
    for (const alias of entry.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      list.push({
        alias,
        regex: new RegExp(`\\b${escaped}\\b`, 'i'),
        entry,
      });
    }
  }
  return list.sort((a, b) => b.alias.length - a.alias.length);
})();

export function isSwapCompliant(swap: SwapOption, filters: AllergenFilters): boolean {
  const blocked: AllergenKey[] = [];
  if (filters.soyFree) blocked.push('soy');
  if (filters.nutFree) blocked.push('nuts');
  if (filters.glutenFree) blocked.push('gluten');
  return !swap.allergens.some((a) => blocked.includes(a));
}

export function selectCompliantSwap(
  entry: SubstitutionEntry,
  filters: AllergenFilters
): { swap: SwapOption; allergenAdjusted: boolean } {
  if (isSwapCompliant(entry.primarySwap, filters)) {
    return { swap: entry.primarySwap, allergenAdjusted: false };
  }

  for (const alt of entry.alternatives) {
    if (isSwapCompliant(alt, filters)) {
      return { swap: alt, allergenAdjusted: true };
    }
  }

  // Fallback: choose the option with the fewest conflicting allergens
  const all = [entry.primarySwap, ...entry.alternatives];
  const scored = all
    .map((option) => {
      let conflicts = 0;
      if (filters.soyFree && option.allergens.includes('soy')) conflicts += 1;
      if (filters.nutFree && option.allergens.includes('nuts')) conflicts += 1;
      if (filters.glutenFree && option.allergens.includes('gluten')) conflicts += 1;
      return { option, conflicts };
    })
    .sort((a, b) => a.conflicts - b.conflicts);

  return {
    swap: scored[0].option,
    allergenAdjusted: scored[0].option !== entry.primarySwap,
  };
}

export function findSubstitutionMatch(text: string): {
  entry: SubstitutionEntry;
  matchedAlias: string;
} | null {
  if (ALREADY_VEGAN_PATTERN.test(text)) {
    return null;
  }

  for (const item of SORTED_MATCH_INDEX) {
    if (item.regex.test(text)) {
      return { entry: item.entry, matchedAlias: item.alias };
    }
  }
  return null;
}

function buildVeganTitle(originalTitle: string): string {
  const trimmed = originalTitle.trim() || 'Custom Dish';
  if (/^(vegan|plant-based|plant based)\b/i.test(trimmed)) {
    return trimmed;
  }
  return `Plant-Based ${trimmed}`;
}

function getVibeGuidance(vibe: CookingVibe, hasMeat: boolean, hasDairy: boolean): string[] {
  switch (vibe) {
    case 'high-protein':
      return [
        hasMeat
          ? 'Protein Boost: Pair primary swaps with pressed extra-firm tofu, tempeh, or edamame to target 25-32g protein per serving.'
          : 'Protein Boost: Stir 2 tbsp hemp hearts or 1/3 cup blended silken tofu into sauces and batters for stealth complete protein.',
        'Use unsweetened soy or pea milk (~8g protein/cup) instead of low-protein nut or rice milks.',
      ];
    case 'quick':
      return [
        'Quick Weeknight Prep: Use store-bought barista oat cream, pre-pressed tofu, or canned lentils to cut soak and simmer times in half.',
        'Whisk miso, nutritional yeast, and lemon together in one bowl as a 30-second umami finisher.',
      ];
    case 'chef':
      return [
        'Chef Technique: Build layered umami by browning aromatics thoroughly, deglazing fond with dry wine or vinegar, and finishing off-heat with acid + cultured fat.',
        hasDairy
          ? 'Pass nut or vegetable cream sauces through a fine-mesh chinois for restaurant-grade sheen.'
          : 'Toast whole spices dry for 30 seconds before grinding to maximize volatile aromatics.',
      ];
    case 'comfort':
      return [
        'Comfort Focus: Don’t skimp on savory richness—finish warm bowls with an extra knob of cultured plant butter, smoked salt, or crispy shallots.',
        'Rest creamy casseroles and pasta bakes 8 minutes out of the oven so starch-emulsions tighten to scoopable perfection.',
      ];
    default:
      return [
        'Balanced Method: Taste and adjust salt + acid (lemon juice or apple cider vinegar) at the very end—plant ingredients shine with bright finishing acidity.',
        'Reserve 1/2 cup starchy cooking water or broth to dial in exact sauce consistency right before plating.',
      ];
  }
}

function rewriteStepText(
  step: string,
  replacements: Array<{ alias: string; swapShortName: string }>
): string {
  let rewritten = step;
  // Sort longest alias first so partial words don't corrupt phrases
  const ordered = [...replacements].sort((a, b) => b.alias.length - a.alias.length);
  for (const { alias, swapShortName } of ordered) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`\\b${escaped}\\b`, 'gi');
    rewritten = rewritten.replace(rx, swapShortName);
  }
  return rewritten;
}

function summarizeSwapName(fullIngredient: string): string {
  // Strip verbose parenthetical recipes for cleaner inline step mentions
  const withoutParens = fullIngredient.replace(/\([^)]*\)/g, '').trim();
  const firstClause = withoutParens.split(/\s+OR\s+/i)[0].trim();
  return firstClause.replace(/\s+/g, ' ');
}

export function formatRecipeMarkdown(recipe: Omit<TransformedRecipe, 'markdown'>): string {
  const activeFlags: string[] = ['100% Plant-Based'];
  if (recipe.filters.soyFree) activeFlags.push('Soy-Free');
  if (recipe.filters.nutFree) activeFlags.push('Nut-Free');
  if (recipe.filters.glutenFree) activeFlags.push('Gluten-Free');

  const lines: string[] = [
    `# ${recipe.veganTitle}`,
    '',
    `> Converted from **${recipe.originalTitle}** · **${recipe.servings} servings** (${recipe.scale}× scale) · Style: **${recipe.vibe}** · Tags: ${activeFlags.join(', ')}`,
    '',
    '## Plant-Based Ingredients',
    '',
    ...recipe.ingredients.map((item) =>
      item.isAnimalDerived
        ? `- ${item.convertedLine} *(replaces ${item.originalLine})*`
        : `- ${item.convertedLine}`
    ),
    '',
  ];

  if (recipe.substitutionsUsed.length > 0) {
    lines.push('## Substitution Ledger & Culinary Chemistry', '');
    lines.push('| Original | Plant-Based Swap | Ratio | Culinary Chemistry |');
    lines.push('| :--- | :--- | :--- | :--- |');
    for (const sub of recipe.substitutionsUsed) {
      lines.push(
        `| ${sub.entry.name} | ${sub.chosenSwap.ingredient} | ${sub.chosenSwap.ratio} | ${sub.entry.chemistryNote} |`
      );
    }
    lines.push('');
  }

  lines.push('## Step-by-Step Method', '');
  recipe.steps.forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step}`);
  });
  lines.push('');

  const allTech = [
    ...recipe.techniquePlan.moisture.map((t) => `- **Moisture:** ${t}`),
    ...recipe.techniquePlan.fat.map((t) => `- **Fat & Emulsion:** ${t}`),
    ...recipe.techniquePlan.umami.map((t) => `- **Umami:** ${t}`),
    ...recipe.techniquePlan.maillard.map((t) => `- **Maillard Browning:** ${t}`),
  ];

  if (allTech.length > 0) {
    lines.push('## Technique & Flavor Adjustments', '', ...allTech, '');
  }

  if (recipe.vibeTips.length > 0) {
    lines.push('## Chef Notes', '', ...recipe.vibeTips.map((t) => `- ${t}`), '');
  }

  lines.push('---', '*Generated offline with Veganify AI — https://veganify-ai.nealfrazier.tech*');
  return lines.join('\n');
}

export function transformRecipe(input: TransformRecipeInput): TransformedRecipe {
  const scale = input.scale && input.scale > 0 ? input.scale : 1;
  const scaledServings = Math.max(1, Math.round((input.servings || 4) * scale));
  const rawLines = input.rawIngredients
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const substitutionsMap = new Map<
    string,
    {
      entry: SubstitutionEntry;
      chosenSwap: SwapOption;
      allergenAdjusted: boolean;
      matchedOriginal: string;
    }
  >();

  const stepReplacements: Array<{ alias: string; swapShortName: string }> = [];

  const convertedIngredients: ConvertedIngredient[] = rawLines.map((line, index) => {
    const parsed = parseIngredientLine(line);
    const alreadyPlantBased = ALREADY_VEGAN_PATTERN.test(parsed.body);
    const match = alreadyPlantBased ? null : findSubstitutionMatch(parsed.body);

    const scaledQty = parsed.quantity !== null ? parsed.quantity * scale : null;

    if (!match) {
      const scaledPrefix =
        scaledQty !== null
          ? `${formatCulinaryNumber(scaledQty)}${parsed.unit ? ` ${parsed.unit}` : ''} `
          : '';
      const suffix = parsed.prepNote ? `, ${parsed.prepNote}` : '';
      return {
        id: `ing-${index}`,
        originalLine: parsed.original,
        convertedLine: `${scaledPrefix}${parsed.body}${suffix}`.trim(),
        isAnimalDerived: false,
        alreadyPlantBased,
        allergenAdjusted: false,
        scaledQuantityLabel: scaledQty !== null ? formatCulinaryNumber(scaledQty) : undefined,
      };
    }

    const { swap, allergenAdjusted } = selectCompliantSwap(match.entry, input.filters);

    if (!substitutionsMap.has(match.entry.id)) {
      substitutionsMap.set(match.entry.id, {
        entry: match.entry,
        chosenSwap: swap,
        allergenAdjusted,
        matchedOriginal: parsed.body,
      });
    }

    const shortSwap = summarizeSwapName(swap.ingredient);
    stepReplacements.push({ alias: match.matchedAlias, swapShortName: shortSwap });
    // Also add entry short aliases if present in steps
    for (const a of match.entry.aliases) {
      if (a.length >= 4 && !stepReplacements.some((r) => r.alias.toLowerCase() === a.toLowerCase())) {
        stepReplacements.push({ alias: a, swapShortName: shortSwap });
      }
    }

    let convertedQuantityPrefix = '';
    if (scaledQty !== null) {
      const adjustedQty = scaledQty * swap.ratioMultiplier;
      const formattedNum = formatCulinaryNumber(adjustedQty);
      const unitToUse = swap.ratioUnitOverride ?? parsed.unit;
      convertedQuantityPrefix = `${formattedNum}${unitToUse ? ` ${unitToUse}` : ''} `;
    }

    const prepSuffix = parsed.prepNote ? ` (${parsed.prepNote})` : '';
    const convertedLine = `${convertedQuantityPrefix}${swap.ingredient}${prepSuffix}`.trim();

    return {
      id: `ing-${index}`,
      originalLine: parsed.original,
      convertedLine,
      isAnimalDerived: true,
      alreadyPlantBased: false,
      substitution: match.entry,
      chosenSwap: swap,
      allergenAdjusted,
      scaledQuantityLabel:
        scaledQty !== null ? formatCulinaryNumber(scaledQty * swap.ratioMultiplier) : undefined,
    };
  });

  const substitutionsUsed = Array.from(substitutionsMap.values());

  // Build deduplicated technique plan
  const moisture = new Set<string>();
  const fat = new Set<string>();
  const umami = new Set<string>();
  const maillard = new Set<string>();

  for (const { entry } of substitutionsUsed) {
    if (entry.technique.moisture) moisture.add(entry.technique.moisture);
    if (entry.technique.fat) fat.add(entry.technique.fat);
    if (entry.technique.umami) umami.add(entry.technique.umami);
    if (entry.technique.maillard) maillard.add(entry.technique.maillard);
  }

  // Rewrite steps cleanly or synthesize method if user only pasted ingredients
  const rawSteps = input.rawSteps
    .split(/\r?\n/)
    .map((s) => s.replace(/^\d+[\.)]\s*/, '').trim())
    .filter(Boolean);

  let steps: string[];
  if (rawSteps.length > 0) {
    steps = rawSteps.map((step) => rewriteStepText(step, stepReplacements));
  } else {
    // Synthesize actionable plant-based workflow when user enters an ingredient list only
    steps = [
      'Prep & mise en place: measure all plant-based swaps, soak any cashews/seeds in hot water for 15 minutes if used, and press tofu or pat mushrooms dry.',
      ...substitutionsUsed.slice(0, 3).map((s) => `Prep ${s.entry.name} swap: ${s.chosenSwap.prepTip}`),
      'Build aromatics and brown primary proteins or mushrooms thoroughly in oil before adding liquids so rich Maillard fond forms.',
      'Combine remaining ingredients and simmer or bake until textures are tender; stir in plant creams, miso, or kala namak off direct heat to protect delicate flavors.',
      'Taste and finish with fresh acid (lemon or vinegar), sea salt, and fresh herbs before serving.',
    ];
  }

  const hasMeat = substitutionsUsed.some(
    (s) => s.entry.category === 'meat-poultry' || s.entry.category === 'seafood'
  );
  const hasDairy = substitutionsUsed.some((s) => s.entry.category === 'dairy');
  const vibeTips = getVibeGuidance(input.vibe, hasMeat, hasDairy);

  const partialResult: Omit<TransformedRecipe, 'markdown'> = {
    originalTitle: input.title.trim() || 'Custom Dish',
    veganTitle: buildVeganTitle(input.title),
    servings: scaledServings,
    scale,
    vibe: input.vibe,
    filters: { ...input.filters },
    ingredients: convertedIngredients,
    substitutionsUsed,
    techniquePlan: {
      moisture: Array.from(moisture),
      fat: Array.from(fat),
      umami: Array.from(umami),
      maillard: Array.from(maillard),
    },
    steps,
    vibeTips,
    animalCount: convertedIngredients.filter((i) => i.isAnimalDerived).length,
    totalIngredients: convertedIngredients.length,
  };

  return {
    ...partialResult,
    markdown: formatRecipeMarkdown(partialResult),
  };
}
