import { AllergenFilters } from '../data/substitutions';
import { CookingVibe, TransformedRecipe } from './converter';

export interface SavedRecipeEntry {
  id: string;
  savedAt: number;
  source: 'offline' | 'vision-byok';
  originalTitle: string;
  veganTitle: string;
  servings: number;
  vibe: CookingVibe;
  filters: AllergenFilters;
  animalCount: number;
  totalIngredients: number;
  markdown: string;
  recipeData?: TransformedRecipe;
  imagePreview?: string;
}

const COOKBOOK_KEY = 'veganify_cookbook_v2';
const LEGACY_HISTORY_KEY = 'veganify_history';

export function loadSavedCookbook(): SavedRecipeEntry[] {
  try {
    const raw = localStorage.getItem(COOKBOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Migrate legacy v1 history entries if present
    const legacy = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (legacy) {
      const oldItems = JSON.parse(legacy);
      if (Array.isArray(oldItems) && oldItems.length > 0) {
        const migrated: SavedRecipeEntry[] = oldItems.map((item: { id?: string; timestamp?: number; recipe?: string; image?: string }) => ({
          id: item.id || String(Date.now()),
          savedAt: item.timestamp || Date.now(),
          source: 'vision-byok',
          originalTitle: 'Photo Analysis Recipe',
          veganTitle: 'Plant-Based Photo Recipe',
          servings: 4,
          vibe: 'balanced',
          filters: { soyFree: false, nutFree: false, glutenFree: false },
          animalCount: 0,
          totalIngredients: 0,
          markdown: item.recipe || '',
          imagePreview: item.image,
        }));
        localStorage.setItem(COOKBOOK_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    return [];
  }
  return [];
}

export function saveRecipeToCookbook(entry: SavedRecipeEntry): SavedRecipeEntry[] {
  const current = loadSavedCookbook();
  const deduped = current.filter((item) => item.id !== entry.id);
  const next = [entry, ...deduped].slice(0, 40);
  try {
    localStorage.setItem(COOKBOOK_KEY, JSON.stringify(next));
  } catch {
    // Handle quota exceeded by stripping heavy base64 images on older items
    const trimmed = next.map((item, idx) =>
      idx > 4 ? { ...item, imagePreview: undefined } : item
    );
    localStorage.setItem(COOKBOOK_KEY, JSON.stringify(trimmed));
    return trimmed;
  }
  return next;
}

export function removeRecipeFromCookbook(id: string): SavedRecipeEntry[] {
  const current = loadSavedCookbook();
  const next = current.filter((item) => item.id !== id);
  localStorage.setItem(COOKBOOK_KEY, JSON.stringify(next));
  return next;
}

export function clearCookbook(): void {
  localStorage.removeItem(COOKBOOK_KEY);
  localStorage.removeItem(LEGACY_HISTORY_KEY);
}

export function downloadMarkdownFile(filename: string, content: string): void {
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'veganify-recipe';
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
