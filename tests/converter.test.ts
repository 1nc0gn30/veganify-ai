import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTITUTION_MATRIX } from '../src/data/substitutions';
import { CLASSIC_DISHES } from '../src/data/classicDishes';
import {
  findSubstitutionMatch,
  formatCulinaryNumber,
  isSwapCompliant,
  parseIngredientLine,
  selectCompliantSwap,
  transformRecipe,
} from '../src/lib/converter';

test('substitution matrix has 60+ unique entries covering all 5 culinary categories', () => {
  assert.ok(
    SUBSTITUTION_MATRIX.length >= 60,
    `Expected >= 60 substitutions, got ${SUBSTITUTION_MATRIX.length}`
  );

  const ids = new Set(SUBSTITUTION_MATRIX.map((e) => e.id));
  assert.equal(ids.size, SUBSTITUTION_MATRIX.length, 'Substitution IDs must be unique');

  const categories = new Set(SUBSTITUTION_MATRIX.map((e) => e.category));
  for (const required of ['dairy', 'eggs-baking', 'meat-poultry', 'seafood', 'stocks-sauces']) {
    assert.ok(categories.has(required as never), `Missing category ${required}`);
  }
});

test('every substitution entry has an allergen-free fallback when soyFree + nutFree + glutenFree are enabled', () => {
  const strictFilters = { soyFree: true, nutFree: true, glutenFree: true };
  for (const entry of SUBSTITUTION_MATRIX) {
    const { swap } = selectCompliantSwap(entry, strictFilters);
    assert.ok(
      isSwapCompliant(swap, strictFilters),
      `Entry "${entry.id}" lacks a soy-free + nut-free + gluten-free swap (got allergens: ${swap.allergens.join(', ')})`
    );
  }
});

test('ingredient parser accurately parses fractions, mixed numbers, unicode fractions, and units', () => {
  const mixed = parseIngredientLine('1 1/2 cups heavy cream, chilled');
  assert.equal(mixed.quantity, 1.5);
  assert.equal(mixed.unit, 'cups');
  assert.equal(mixed.body, 'heavy cream');
  assert.equal(mixed.prepNote, 'chilled');

  const unicode = parseIngredientLine('½ lb ground beef');
  assert.equal(unicode.quantity, 0.5);
  assert.equal(unicode.unit, 'lb');
  assert.equal(unicode.body, 'ground beef');

  const countOnly = parseIngredientLine('4 large egg yolks');
  assert.equal(countOnly.quantity, 4);
  assert.equal(countOnly.body, 'large egg yolks');
});

test('culinary fraction formatter formats clean fractions', () => {
  assert.equal(formatCulinaryNumber(0.5), '1/2');
  assert.equal(formatCulinaryNumber(1.75), '1 3/4');
  assert.equal(formatCulinaryNumber(2.333), '2 1/3');
  assert.equal(formatCulinaryNumber(4), '4');
});

test('already plant-based ingredients are never double-converted', () => {
  const veganItems = [
    '1 cup unsweetened oat milk',
    '2 tbsp peanut butter',
    '1 block extra-firm tofu',
    '1 cup coconut milk',
    '2 medium eggplants, cubed',
    '1 tbsp vegan butter',
    '1/4 tsp cream of tartar',
  ];

  for (const line of veganItems) {
    const parsed = parseIngredientLine(line);
    const match = findSubstitutionMatch(parsed.body);
    assert.equal(match, null, `Expected "${line}" to stay untouched, matched "${match?.entry.id}"`);
  }
});

test('specific multi-word animal ingredients match before generic words', () => {
  assert.equal(findSubstitutionMatch('chicken broth')?.entry.id, 'chicken-broth');
  assert.equal(findSubstitutionMatch('heavy whipping cream')?.entry.id, 'heavy-cream');
  assert.equal(findSubstitutionMatch('large egg yolks')?.entry.id, 'egg-yolk');
  assert.equal(findSubstitutionMatch('buttermilk')?.entry.id, 'buttermilk');
  assert.equal(findSubstitutionMatch('anchovy fillets')?.entry.id, 'anchovies');
});

test('allergen filters dynamically reroute swaps for Spaghetti Carbonara', () => {
  const carbonara = CLASSIC_DISHES.find((d) => d.id === 'spaghetti-carbonara')!;
  const standard = transformRecipe({
    title: carbonara.name,
    servings: carbonara.servings,
    scale: 1,
    rawIngredients: carbonara.ingredients.join('\n'),
    rawSteps: carbonara.steps.join('\n'),
    filters: { soyFree: false, nutFree: false, glutenFree: false },
    vibe: 'balanced',
  });

  assert.equal(standard.animalCount, 3, 'Carbonara has 3 animal-derived lines (guanciale, egg yolks, parmesan)');
  assert.match(standard.markdown, /cashew/i);

  const nutAndSoyFree = transformRecipe({
    title: carbonara.name,
    servings: carbonara.servings,
    scale: 2,
    rawIngredients: carbonara.ingredients.join('\n'),
    rawSteps: carbonara.steps.join('\n'),
    filters: { soyFree: true, nutFree: true, glutenFree: true },
    vibe: 'chef',
  });

  assert.equal(nutAndSoyFree.servings, carbonara.servings * 2);
  for (const used of nutAndSoyFree.substitutionsUsed) {
    assert.equal(used.chosenSwap.allergens.length, 0, `Swap for ${used.entry.id} must be allergen-free`);
  }
  assert.match(nutAndSoyFree.markdown, /Soy-Free/);
  assert.match(nutAndSoyFree.markdown, /Nut-Free/);
  assert.match(nutAndSoyFree.markdown, /Gluten-Free/);
});

test('all 12 classic dishes convert cleanly with non-empty swaps, technique adjustments, and markdown', () => {
  assert.ok(CLASSIC_DISHES.length >= 12);

  for (const dish of CLASSIC_DISHES) {
    const out = transformRecipe({
      title: dish.name,
      servings: dish.servings,
      scale: 1,
      rawIngredients: dish.ingredients.join('\n'),
      rawSteps: dish.steps.join('\n'),
      filters: { soyFree: false, nutFree: false, glutenFree: false },
      vibe: 'balanced',
    });

    assert.ok(out.animalCount >= 2, `Expected >=2 swaps for ${dish.name}, got ${out.animalCount}`);
    assert.ok(out.steps.length >= 4, `Expected >=4 steps for ${dish.name}`);
    assert.ok(out.markdown.includes(`# ${out.veganTitle}`), `Markdown missing title for ${dish.name}`);
    assert.ok(out.markdown.includes('## Substitution Ledger'), `Markdown missing ledger for ${dish.name}`);
  }
});

test('ingredient-only input synthesizes a usable plant-based workflow', () => {
  const out = transformRecipe({
    title: 'Creamy Garlic Shrimp Pasta',
    servings: 2,
    scale: 1,
    rawIngredients: '8 oz jumbo shrimp\n3 tbsp unsalted butter\n1/2 cup heavy cream\n1/3 cup parmesan cheese\n3 cloves garlic',
    rawSteps: '',
    filters: { soyFree: false, nutFree: true, glutenFree: false },
    vibe: 'quick',
  });

  assert.equal(out.animalCount, 4);
  assert.ok(out.steps.length >= 5, 'Should synthesize actionable steps when rawSteps is blank');
  assert.ok(out.vibeTips.some((t) => /Quick Weeknight/i.test(t)));
});
