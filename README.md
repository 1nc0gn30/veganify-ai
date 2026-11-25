# Veganify AI

Offline-first plant-based recipe transformation engine and culinary substitution matrix. Convert any non-vegan dish or ingredient list into exact plant-based ratios, allergen-safe swaps, and step-by-step instructions directly in the browser with zero API keys or accounts required.

- **Live URL:** https://veganify-ai.nealfrazier.tech
- **Source:** https://github.com/1nc0gn30/veganify-ai

## What It Does

- **Dish & Ingredient-List Converter (`src/lib/converter.ts`)**: Parses quantities (integers, decimals, mixed fractions, Unicode fractions), units, and prep notes from pasted recipes or 12 classic presets (Spaghetti Carbonara, Butter Chicken, Smash Cheeseburger, French Herb Omelette, Baked Mac & Cheese, Classic Tiramisu, Burgundy Beef Stew, Clam Chowder, Buttermilk Pancakes, Caesar Salad, Tonkotsu Ramen, Fudgy Brownies).
- **65-Ingredient Substitution Matrix (`src/data/substitutions.ts`)**: Covers Dairy & Cheeses (16), Eggs & Baking (11), Meat & Poultry (16), Seafood & Shellfish (10), and Stocks, Sauces & Condiments (12), each paired with exact conversion ratios, culinary chemistry notes (emulsion, leavening, binding, umami, Maillard browning), and cooking technique adjustments.
- **Dynamic Allergen Routing**: Toggling **Soy-Free**, **Nut-Free**, or **Gluten-Free** (individually or combined) automatically selects compliant plant swaps across the converter and pantry calculator while preserving texture and flavor roles.
- **Interactive Pantry Ratio Calculator & Searchable Guide (`src/components/SubstitutionGuide.tsx`)**: Filter by category, culinary function, or keyword and calculate exact swap measures for arbitrary quantities.
- **Local Cookbook & Export (`src/components/CookbookView.tsx`)**: Saves converted recipes to browser `localStorage`, supports interactive ingredient check-off, copies Markdown, downloads `.md` recipe cards, and includes a clean `@media print` recipe layout.
- **Optional BYOK Photo Vision (`src/components/VisionByokView.tsx`)**: Analyze dish photos directly from the browser using your own Google Gemini or OpenAI key, stored locally with optional AES-256-GCM PBKDF2 passphrase encryption (`src/lib/secureSettings.ts`).

## Local Development & Verification

```bash
npm install
npm run dev          # Start Vite dev server on http://localhost:3000
npm run lint         # TypeScript type-check (tsc --noEmit)
npm test             # Run converter unit tests + SEO/guardrail assertions
npm run build        # Production bundle to dist/
```

## Architecture

```text
src/
  data/
    substitutions.ts      # 65 animal-to-plant entries with allergen alternatives & food science notes
    classicDishes.ts      # 12 non-vegan classic recipe presets
  lib/
    converter.ts          # Deterministic parser, fraction scaler, swap router, step rewriter & Markdown export
    storage.ts            # localStorage cookbook persistence and .md file export
    ai.ts                 # Optional BYOK Gemini / OpenAI photo vision client
    secureSettings.ts     # WebCrypto PBKDF2 + AES-GCM passphrase vault for optional BYOK keys
  components/
    ConverterWorkspace.tsx
    SubstitutionGuide.tsx
    CookbookView.tsx
    VisionByokView.tsx
tests/
  converter.test.ts       # Unit tests for parser, matrix integrity, allergen routing, and 12 presets
  guardrail.test.mjs      # SEO/AEO JSON-LD, OG PNG, robots/sitemap, netlify.toml, and open-access checks
```

## License & Attribution

100% free and open-access with zero paywalls.

Engineered by [Neal Frazier Tech (@1nc0gn30)](https://github.com/1nc0gn30/veganify-ai) • [NullAI Platform](https://nullai.tech)
