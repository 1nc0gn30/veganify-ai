export type SubstitutionCategory =
  | 'dairy'
  | 'eggs-baking'
  | 'meat-poultry'
  | 'seafood'
  | 'stocks-sauces';

export type AllergenKey = 'soy' | 'nuts' | 'gluten';

export type ChemistryRole =
  | 'emulsion'
  | 'umami'
  | 'binding'
  | 'leavening'
  | 'fat-richness'
  | 'texture'
  | 'maillard'
  | 'acid-tang';

export interface AllergenFilters {
  soyFree: boolean;
  nutFree: boolean;
  glutenFree: boolean;
}

export interface SwapOption {
  ingredient: string;
  ratio: string;
  ratioMultiplier: number;
  ratioUnitOverride?: string;
  prepTip: string;
  allergens: AllergenKey[];
}

export interface TechniqueAdjustment {
  moisture?: string;
  fat?: string;
  umami?: string;
  maillard?: string;
}

export interface SubstitutionEntry {
  id: string;
  name: string;
  aliases: string[];
  category: SubstitutionCategory;
  primarySwap: SwapOption;
  alternatives: SwapOption[];
  chemistryRoles: ChemistryRole[];
  chemistryNote: string;
  technique: TechniqueAdjustment;
  flavorPairings: string[];
}

export const CATEGORY_META: Record<
  SubstitutionCategory,
  { label: string; shortLabel: string; description: string }
> = {
  dairy: {
    label: 'Dairy & Cheeses',
    shortLabel: 'Dairy',
    description: 'Milk, creams, cultured fats, melting cheeses, and aged hard cheeses.',
  },
  'eggs-baking': {
    label: 'Eggs & Baking',
    shortLabel: 'Eggs & Baking',
    description: 'Binders, leaveners, foams, emulsions, custards, and sweeteners.',
  },
  'meat-poultry': {
    label: 'Meat & Poultry',
    shortLabel: 'Meat & Poultry',
    description: 'Muscle fibers, cured pork, braising cuts, seared proteins, and animal fats.',
  },
  seafood: {
    label: 'Seafood & Shellfish',
    shortLabel: 'Seafood',
    description: 'Oceanic salinity, flaky fillets, chewy shellfish, and briny finishers.',
  },
  'stocks-sauces': {
    label: 'Stocks, Sauces & Condiments',
    shortLabel: 'Stocks & Sauces',
    description: 'Savory bases, fermented umami boosters, dressings, and finishing sauces.',
  },
};

export const CHEMISTRY_ROLE_LABELS: Record<ChemistryRole, string> = {
  emulsion: 'Emulsion',
  umami: 'Umami',
  binding: 'Binding',
  leavening: 'Leavening',
  'fat-richness': 'Fat / Richness',
  texture: 'Texture',
  maillard: 'Maillard',
  'acid-tang': 'Acid / Tang',
};

export const SUBSTITUTION_MATRIX: SubstitutionEntry[] = [
  // ================= DAIRY (16) =================
  {
    id: 'heavy-cream',
    name: 'Heavy Cream / Whipping Cream',
    aliases: ['heavy whipping cream', 'heavy cream', 'whipping cream', 'double cream', 'thickened cream'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'soaked raw cashew cream (1:1 cashews blended with hot water)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Soak raw cashews in boiling water 15 min, then blend until completely satin-smooth.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'full-fat oat cream or chilled coconut cream',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Use barista oat cream for neutral savory sauces, or chilled coconut cream for curries and whipped toppings.',
        allergens: [],
      },
      {
        ingredient: 'blended silken tofu with 1 tbsp neutral oil per cup',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Purée until glossy; adds high-protein body without coconut aroma.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['emulsion', 'fat-richness'],
    chemistryNote: 'Milkfat globules coat the palate and stabilize sauces. Fine nut emulsions or oat beta-glucans mimic the same viscosity and mouthfeel.',
    technique: {
      fat: 'Finish sauces off direct boil so plant emulsions stay glossy instead of splitting.',
      moisture: 'Reduce gently over medium-low heat; cashew and oat creams thicken faster than dairy cream.',
    },
    flavorPairings: ['white miso', 'nutritional yeast', 'lemon zest'],
  },
  {
    id: 'half-and-half',
    name: 'Half-and-Half / Single Cream',
    aliases: ['half-and-half', 'half and half', 'single cream', 'light cream', 'table cream'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'barista-style unsweetened oat milk',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Barista blends contain dipotassium phosphate and emulsified oil so they resist curdling in acid or coffee.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'unsweetened soy milk + 1 tbsp refined coconut oil per cup',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Whisk warm so the fat stays suspended.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['emulsion', 'fat-richness'],
    chemistryNote: 'At ~12% fat, half-and-half bridges milk and cream. Emulsified oat or enriched soy milk matches its lipid-to-water balance.',
    technique: {
      moisture: 'Add gradually off high heat if combining with tomato or wine acids.',
    },
    flavorPairings: ['nutmeg', 'white pepper'],
  },
  {
    id: 'whole-milk',
    name: 'Whole Milk / Dairy Milk',
    aliases: ['whole milk', '2% milk', 'skim milk', 'cow milk', 'dairy milk', 'milk'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'unsweetened soy milk',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Matches dairy protein (~7-8g/cup) for baking structure and browning.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'unsweetened creamy oat milk',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Use plain unsweetened (never vanilla) for savory dishes and batters.',
        allergens: [],
      },
      {
        ingredient: 'unsweetened almond or pea milk',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Pea-protein milk adds baking structure without soy or nuts.',
        allergens: ['nuts'],
      },
    ],
    chemistryRoles: ['moisture' as never, 'emulsion', 'maillard'].filter((r) => r !== ('moisture' as never)) as ChemistryRole[],
    chemistryNote: 'Soy protein curdles and browns almost identically to casein in batters and sauces; oat milk brings natural maltose for gentle browning.',
    technique: {
      maillard: 'Unsweetened soy or oat milk browns well in roux, pancakes, and breads.',
    },
    flavorPairings: ['pinch of sea salt', 'nutritional yeast'],
  },
  {
    id: 'buttermilk',
    name: 'Buttermilk',
    aliases: ['cultured buttermilk', 'buttermilk'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'unsweetened soy milk curdled with 1 tbsp apple cider vinegar per cup',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Whisk acid into room-temperature soy milk and rest 5-10 minutes until softly curdled.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'unsweetened oat milk + 1 tbsp lemon juice or apple cider vinegar per cup',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Rest 5 minutes; reacts instantly with baking soda for tender crumb.',
        allergens: [],
      },
    ],
    chemistryRoles: ['acid-tang', 'leavening'],
    chemistryNote: 'Lactic acid in buttermilk reacts with sodium bicarbonate (baking soda) to release CO2 bubbles and tenderize gluten networks.',
    technique: {
      moisture: 'Fold curdled plant buttermilk gently into dry ingredients; overmixing toughens batters.',
    },
    flavorPairings: ['baking soda', 'lemon zest'],
  },
  {
    id: 'butter',
    name: 'Butter (Unsalted / Salted)',
    aliases: ['unsalted butter', 'salted butter', 'sweet cream butter', 'melted butter', 'cold butter', 'butter'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'cultured plant-based block butter (80% fat)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Choose stick/block format (not tub spread) so water content stays around 16-20% for pastry lamination and sautéing.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'refined coconut oil + pinch of flaky salt (for baking) or extra-virgin olive oil (3/4 cup per 1 cup butter)',
        ratio: '1:1 (block) or 3/4:1 (oil)',
        ratioMultiplier: 1,
        prepTip: 'Pure oils contain 100% fat vs 80% in butter, so reduce oil by 20% and add 2 tbsp water/plant milk in cakes.',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'maillard', 'texture'],
    chemistryNote: 'Butter provides 80% saturated/monounsaturated fat for tenderization plus milk solids that brown. Cultured block vegan butter replicates steam pockets in pastry.',
    technique: {
      fat: 'Keep block plant butter chilled until the last second for flaky biscuits, pie dough, or mounted pan sauces.',
      maillard: 'Add a tiny pinch of nutritional yeast or soy lecithin when browning plant butter to mimic toasted milk solids.',
    },
    flavorPairings: ['flaky sea salt', 'fresh sage', 'garlic'],
  },
  {
    id: 'ghee',
    name: 'Ghee / Clarified Butter',
    aliases: ['clarified butter', 'ghee'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'refined coconut oil infused with 1/2 tsp toasted fenugreek or plant-based ghee',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Warm refined coconut oil gently with a pinch of turmeric and toasted sesame or curry leaf for nutty depth.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'avocado oil + 1 tsp vegan cultured butter per 2 tbsp',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Delivers high smoke point for blooming whole spices (tadka).',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'maillard'],
    chemistryNote: 'Ghee is 99.5% pure butterfat with a high smoke point (~485°F) used to bloom fat-soluble spice aromatics.',
    technique: {
      fat: 'Bloom whole cumin, cardamom, and garam masala in hot oil for 30-45 seconds before adding aromatics.',
    },
    flavorPairings: ['garam masala', 'fenugreek leaves', 'cardamom'],
  },
  {
    id: 'parmesan',
    name: 'Parmesan / Pecorino Romano',
    aliases: ['parmigiano-reggiano', 'parmigiano reggiano', 'pecorino romano', 'parmesan cheese', 'grated parmesan', 'parmesan', 'pecorino', 'grana padano'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'savory cashew-nutritional yeast parmesan (cashews, nutritional yeast, garlic powder, sea salt)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Pulse 3/4 cup raw cashews, 3 tbsp nutritional yeast, 3/4 tsp fine sea salt, and 1/4 tsp garlic powder into sandy crumbs.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'hemp seed & sunflower nutritional yeast parmesan + 1/2 tsp white miso paste',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Nut-free and soy-free when made with chickpea miso; melts cleanly into pasta water emulsions.',
        allergens: [],
      },
      {
        ingredient: 'aged plant-based parmesan wedge (finely microplaned)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Finely grate off-heat so starches emulsify with starchy cooking water.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'emulsion'],
    chemistryNote: 'Aged hard cheeses pack dense free glutamates (~1200mg/100g) and salty crystals. Nutritional yeast + fermented miso + ground seeds reconstruct that exact umami punch.',
    technique: {
      umami: 'Combine nutritional yeast with a touch of white/chickpea miso and cracked black pepper to replicate aged casein tang.',
    },
    flavorPairings: ['nutritional yeast', 'white miso', 'cracked black pepper'],
  },
  {
    id: 'cheddar',
    name: 'Cheddar / Sharp Melting Cheese',
    aliases: ['sharp cheddar', 'cheddar cheese', 'cheddar', 'american cheese', 'monterey jack', 'colby jack', 'gruyere', 'gruyère', 'swiss cheese', 'provolone'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'aged plant-based cheddar shreds OR blended potato-carrot-cashew cheese sauce',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'For melting on burgers, add 1 tbsp water to the hot skillet and cover with a lid for 45 seconds to steam-melt.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'nut-free tapioca-potato cheese sauce (boiled potato, carrot, nutritional yeast, tapioca starch, mustard, lactic acid/lemon)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Blending cooked Yukon Gold potato with 2 tbsp tapioca starch produces authentic stretchy cheese pull with zero nuts or soy.',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'umami', 'texture'],
    chemistryNote: 'Cheddar combines lactic sharpness, annatto warmth, and stretchy melt. Tapioca starch supplies elasticity while Dijon mustard and cider vinegar supply sharp tang.',
    technique: {
      fat: 'Steam plant cheese slices under a covered dome for 30-60 seconds; dry heat alone dries them out before melting.',
      umami: 'Add 1/2 tsp Dijon mustard and a pinch of smoked paprika to vegan cheese sauces for sharp cheddar complexity.',
    },
    flavorPairings: ['Dijon mustard', 'tapioca starch', 'smoked paprika'],
  },
  {
    id: 'mozzarella',
    name: 'Mozzarella / Fresh Burrata',
    aliases: ['fresh mozzarella', 'mozzarella cheese', 'mozzarella', 'burrata'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'pourable tapioca-cashew mozzarella or plant-based fresh mozzarella',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Liquid pourable vegan mozzarella blisters and browns under a 500°F broiler far better than dry pre-shredded cheese.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'nut-free sunflower-tapioca meltable mozzarella',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Whisk soaked sunflower seed milk, tapioca starch, refined coconut oil, and salt over medium heat until stretchy.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'fat-richness'],
    chemistryNote: 'Mozzarella’s signature pull comes from aligned protein-fat matrices; heated tapioca starch forms an elastic hydrocolloid gel that stretches similarly.',
    technique: {
      maillard: 'Brush plant mozzarella lightly with olive oil before broiling to encourage golden blistering.',
    },
    flavorPairings: ['fresh basil', 'olive oil', 'sea salt'],
  },
  {
    id: 'ricotta',
    name: 'Ricotta / Cottage Cheese',
    aliases: ['whole milk ricotta', 'ricotta cheese', 'ricotta', 'cottage cheese'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'pulsed firm tofu ricotta (firm tofu, nutritional yeast, lemon juice, olive oil, garlic, salt)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Pulse lightly in a food processor so it retains soft curds—never purée completely smooth.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'blanched almond or sunflower-seed ricotta with lemon juice and olive oil',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soak seeds/almonds, pulse coarsely with water and lemon for fluffy dairy-free curds.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'acid-tang'],
    chemistryNote: 'Ricotta is a grainy whey curd with mild lactic brightness. Crumbled coagulated tofu matches the curd geometry and moisture retention inside baked pasta.',
    technique: {
      moisture: 'Press firm tofu for 10 minutes before pulsing so baked lasagna or stuffed shells stay structured, not watery.',
    },
    flavorPairings: ['lemon zest', 'fresh basil', 'nutmeg'],
  },
  {
    id: 'cream-cheese',
    name: 'Cream Cheese',
    aliases: ['cream cheese', 'neufchatel', 'philadelphia cream cheese'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'cultured plant-based cream cheese (cashew or coconut-oil base)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Bring to room temperature before whipping for frostings or cheesecakes to prevent lumps.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'coconut-oil & starch cultured cream cheese (nut-free, soy-free)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Add 1 tsp cornstarch per 8 oz when baking cheesecakes to ensure a clean slice.',
        allergens: [],
      },
    ],
    chemistryRoles: ['emulsion', 'acid-tang', 'fat-richness'],
    chemistryNote: 'High milkfat (~33%) plus cultured tang stabilizes spreads and frostings. Cultured plant bases replicate the pH and spreadability.',
    technique: {
      moisture: 'Chill vegan cream cheese frostings 20 minutes before piping so coconut/plant fats firm up.',
    },
    flavorPairings: ['lemon juice', 'vanilla bean', 'chives'],
  },
  {
    id: 'mascarpone',
    name: 'Mascarpone',
    aliases: ['mascarpone cheese', 'mascarpone'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'whipped silken tofu + chilled coconut cream + 1 tbsp cashew butter & lemon juice',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Drain silken tofu gently, blend with cold solid coconut cream until airy and velvety, then chill 2 hours to set.',
      allergens: ['soy', 'nuts'],
    },
    alternatives: [
      {
        ingredient: 'whipped chilled full-fat coconut cream + dairy-free cream cheese (1:1 blend)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free and nut-free when using coconut/oat cream cheese; whips into rich tiramisu layers.',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'emulsion'],
    chemistryNote: 'Mascarpone is ~45% fat coagulated with citric acid. Combining dense chilled coconut fat with tangy plant cream cheese mimics its plush set.',
    technique: {
      fat: 'Refrigerate mixing bowl and coconut cream overnight; only scoop the firm top cream.',
    },
    flavorPairings: ['espresso', 'marsala wine', 'vanilla extract'],
  },
  {
    id: 'sour-cream',
    name: 'Sour Cream / Crème Fraîche',
    aliases: ['crème fraîche', 'creme fraiche', 'sour cream', 'mexican crema'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'unsweetened plant-based sour cream or blended cashew cream + 2 tsp lemon juice per cup',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'A pinch of apple cider vinegar plus salt brightens rich plant creams to match cultured dairy.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'unsweetened thick coconut or oat yogurt + 1 tsp lemon juice',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Stir into warm soups off the heat so the live cultures stay silky.',
        allergens: [],
      },
    ],
    chemistryRoles: ['acid-tang', 'fat-richness'],
    chemistryNote: 'Cultured sour cream cuts through rich stews with ~20% fat and bright acidity.',
    technique: {
      fat: 'Swirl in off-heat as a finishing garnish to preserve thick body.',
    },
    flavorPairings: ['chives', 'lime zest', 'apple cider vinegar'],
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt / Plain Yogurt',
    aliases: ['greek yogurt', 'plain yogurt', 'whole milk yogurt', 'yogurt'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'thick unsweetened soy or almond-milk Greek-style yogurt',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'For marinades like Butter Chicken, thick soy yogurt clings to protein and tenderizes spices.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'thick unsweetened coconut or oat yogurt + 1 tsp lemon juice',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Strain thin plant yogurt through cheesecloth for 30 minutes to achieve Greek density.',
        allergens: [],
      },
    ],
    chemistryRoles: ['acid-tang', 'emulsion'],
    chemistryNote: 'Yogurt marinades use lactic acid and thick viscosity to bind spices onto surfaces before roasting.',
    technique: {
      moisture: 'Pat marinated pieces lightly or roast at high heat (425°F) so yogurt caramelizes cleanly.',
    },
    flavorPairings: ['ginger', 'garlic', 'lemon juice'],
  },
  {
    id: 'condensed-milk',
    name: 'Sweetened Condensed Milk',
    aliases: ['sweetened condensed milk', 'condensed milk', 'evaporated milk'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'sweetened condensed coconut or oat milk',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Available canned, or simmer 2 cups oat/coconut milk with 2/3 cup sugar until reduced by half.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'reduced soy milk simmered with maple syrup/sugar by 50%',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Stir frequently over medium-low heat to prevent scorching.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['fat-richness', 'maillard'],
    chemistryNote: 'Concentrated sugars and fats produce caramelized chew in fudge, key lime pie, and tres leches.',
    technique: {
      moisture: 'Simmer slowly without boiling vigorously to keep sugars from crystallizing.',
    },
    flavorPairings: ['vanilla bean', 'pinch of salt'],
  },
  {
    id: 'feta',
    name: 'Feta / Goat Cheese',
    aliases: ['feta cheese', 'goat cheese', 'chèvre', 'chevre', 'feta'],
    category: 'dairy',
    primarySwap: {
      ingredient: 'marinated extra-firm tofu cubes (lemon, apple cider vinegar, olive oil, white miso, oregano)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Crumble pressed extra-firm tofu into brine for 20+ minutes for authentic salty, tangy curds.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'cultured coconut-oil Greek-style plant feta block',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free and nut-free; crumbles cleanly over salads and baked pastas.',
        allergens: [],
      },
    ],
    chemistryRoles: ['acid-tang', 'texture'],
    chemistryNote: 'Feta’s punch comes from brined salinity and sharp acidity paired with crumbly moisture.',
    technique: {
      umami: 'Marinate tofu feta with 1 tsp white miso or caper brine for briny complexity.',
    },
    flavorPairings: ['oregano', 'caper brine', 'lemon juice'],
  },

  // ================= EGGS & BAKING (11) =================
  {
    id: 'egg-yolk',
    name: 'Egg Yolks (Custards / Carbonara / Emulsions)',
    aliases: ['large egg yolks', 'egg yolks', 'egg yolk', 'yolks'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'silky cashew-nutritional yeast emulsion + pinch of kala namak (black salt) & turmeric',
      ratio: '2 tbsp emulsion per egg yolk',
      ratioMultiplier: 2,
      ratioUnitOverride: 'tbsp',
      prepTip: 'Blend soaked cashews, hot starchy water, nutritional yeast, 1/8 tsp turmeric (color), and 1/4 tsp kala namak (sulfurous eggy aroma).',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'blended silken tofu + 1 tsp olive oil + pinch kala namak & turmeric per yolk',
        ratio: '2 tbsp per yolk',
        ratioMultiplier: 2,
        ratioUnitOverride: 'tbsp',
        prepTip: 'Whisk with hot pasta water off the flame for silky carbonara coating without scrambling.',
        allergens: ['soy'],
      },
      {
        ingredient: 'cornstarch-oat cream slurry + 1/2 tsp sunflower lecithin + pinch kala namak & turmeric',
        ratio: '2 tbsp per yolk',
        ratioMultiplier: 2,
        ratioUnitOverride: 'tbsp',
        prepTip: 'Completely nut-free, soy-free, and gluten-free emulsion with true yolk richness.',
        allergens: [],
      },
    ],
    chemistryRoles: ['emulsion', 'fat-richness', 'umami'],
    chemistryNote: 'Egg yolks owe their magic to lecithin phospholipids (emulsification), fat, and gentle heat thickening. Kala namak supplies natural sulfur aromatics.',
    technique: {
      fat: 'Toss carbonara or custard emulsions OFF the burner with reserved starchy water to maintain glossy suspension.',
      umami: 'Add kala namak (Himalayan black salt) at the very end—prolonged boiling dissipates its volatile sulfur compounds.',
    },
    flavorPairings: ['kala namak (black salt)', 'turmeric', 'nutritional yeast'],
  },
  {
    id: 'egg-white',
    name: 'Egg Whites (Meringue / Foam / Binding)',
    aliases: ['large egg whites', 'egg whites', 'egg white', 'meringue'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'aquafaba (chilled chickpea liquid) + 1/8 tsp cream of tartar',
      ratio: '3 tbsp aquafaba per egg white',
      ratioMultiplier: 3,
      ratioUnitOverride: 'tbsp',
      prepTip: 'Whip chilled aquafaba with cream of tartar on high speed for 6-8 minutes until stiff glossy peaks form.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'chia gel (1 tbsp white chia seeds + 3 tbsp water) for non-foamed binding',
        ratio: '3 tbsp per egg white',
        ratioMultiplier: 3,
        ratioUnitOverride: 'tbsp',
        prepTip: 'Use when structure rather than aeration is needed.',
        allergens: [],
      },
    ],
    chemistryRoles: ['leavening', 'binding', 'emulsion'],
    chemistryNote: 'Aquafaba contains legume albumins, globulins, and saponins that trap air bubbles into stable foams identical to ovalbumin in egg whites.',
    technique: {
      moisture: 'Reduce watery canned chickpea brine by 25% if it looks thin, then chill completely before whipping.',
    },
    flavorPairings: ['cream of tartar', 'vanilla extract'],
  },
  {
    id: 'scrambled-omelette-egg',
    name: 'Eggs (Omelette / Scramble / Frittata)',
    aliases: ['beaten eggs', 'whisked eggs', 'scrambled eggs', 'omelette eggs', 'omelet eggs'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'mung bean liquid egg batter OR chickpea flour & silken tofu omelette batter + kala namak',
      ratio: '1/4 cup batter per egg',
      ratioMultiplier: 0.25,
      ratioUnitOverride: 'cup',
      prepTip: 'Blend 1/2 cup soaked split yellow mung beans (or chickpea flour + silken tofu), 1/2 tsp baking powder, 1/4 tsp kala namak, and pinch turmeric.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'besan (chickpea flour) + sparkling water + nutritional yeast + kala namak batter',
        ratio: '3 tbsp chickpea flour + 3 tbsp water per egg',
        ratioMultiplier: 3,
        ratioUnitOverride: 'tbsp',
        prepTip: 'Soy-free, nut-free, gluten-free; rest batter 10 min so chickpea starch hydrates for a tender, foldable omelette.',
        allergens: [],
      },
    ],
    chemistryRoles: ['binding', 'texture', 'umami'],
    chemistryNote: 'Mung bean proteins (vicilin) thermally coagulate between 165-185°F just like egg proteins, creating tender curds and foldable omelettes.',
    technique: {
      maillard: 'Cook in a well-oiled nonstick skillet over medium-low heat covered for 2 minutes so the center sets before folding.',
      umami: 'Finish with a pinch of kala namak and fresh chives right before plating.',
    },
    flavorPairings: ['kala namak', 'chives', 'tarragon', 'nutritional yeast'],
  },
  {
    id: 'whole-egg',
    name: 'Whole Eggs (Baking & Binding)',
    aliases: ['large eggs', 'whole eggs', 'medium eggs', 'free-range eggs', 'eggs', 'egg'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'flax egg (1 tbsp ground golden flaxseed + 2.5 tbsp warm water per egg)',
      ratio: '1 flax egg per egg',
      ratioMultiplier: 1,
      ratioUnitOverride: 'flax egg',
      prepTip: 'Whisk ground flax with warm water and rest 5-8 minutes until mucilage gels; ideal for pancakes, brownies, and muffins.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'aquafaba (3 tbsp whipped chickpea liquid per egg) for airy cakes & brownies',
        ratio: '3 tbsp per egg',
        ratioMultiplier: 3,
        ratioUnitOverride: 'tbsp',
        prepTip: 'Produces shiny crackly tops on fudgy brownies when whipped with sugar.',
        allergens: [],
      },
      {
        ingredient: 'unsweetened applesauce or mashed ripe banana (1/4 cup per egg + 1/2 tsp baking powder)',
        ratio: '1/4 cup per egg',
        ratioMultiplier: 0.25,
        ratioUnitOverride: 'cup',
        prepTip: 'Best for moist quick breads, muffins, and dense cakes.',
        allergens: [],
      },
    ],
    chemistryRoles: ['binding', 'leavening', 'emulsion'],
    chemistryNote: 'Flax mucilage forms a viscous polysaccharide matrix that traps moisture and binds flour particles; aquafaba replicates whipped sugar-egg crusts.',
    technique: {
      moisture: 'Add 1/2 tsp extra baking powder when replacing 2+ eggs in tall cakes to compensate for lost steam-lift.',
    },
    flavorPairings: ['baking powder', 'apple cider vinegar', 'vanilla'],
  },
  {
    id: 'mayonnaise',
    name: 'Mayonnaise',
    aliases: ['mayonnaise', 'mayo', 'aioli'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'aquafaba or soy-milk emulsified vegan mayonnaise',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Blend 3 tbsp aquafaba, 1 tsp Dijon mustard, 1 tbsp lemon juice, and slowly drizzle 3/4 cup neutral oil with an immersion blender.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'blended silken tofu + lemon juice + Dijon mustard + 2 tbsp olive oil',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Lower-fat, high-protein creamy dressing base.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['emulsion', 'fat-richness'],
    chemistryNote: 'Soy lecithin or aquafaba saponins surround oil droplets in water, forming an oil-in-water emulsion identical in sheen to egg mayo.',
    technique: {
      fat: 'Keep oil and aquafaba at the same temperature when blending homemade mayo for an instant emulsion.',
    },
    flavorPairings: ['Dijon mustard', 'garlic', 'lemon juice'],
  },
  {
    id: 'honey',
    name: 'Honey',
    aliases: ['raw honey', 'wildflower honey', 'clover honey', 'honey'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'pure maple syrup or organic agave nectar',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Maple brings warm caramel notes; light agave or brown rice syrup matches mild floral honey.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'dandelion honey or date syrup (for rich dark glazes)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Infuse syrup with chamomile flowers for authentic floral honey aroma.',
        allergens: [],
      },
    ],
    chemistryRoles: ['maillard', 'texture'],
    chemistryNote: 'Invert sugars in agave and maple keep baked goods humectant (moist) and promote deep golden browning.',
    technique: {
      moisture: 'Maple syrup is slightly thinner than honey; reduce other recipe liquids by 1 tbsp per 1/2 cup in delicate batters.',
    },
    flavorPairings: ['lemon', 'cinnamon', 'ginger'],
  },
  {
    id: 'gelatin',
    name: 'Gelatin (Sheets or Powder)',
    aliases: ['unflavored gelatin', 'gelatin sheets', 'gelatin powder', 'gelatine', 'gelatin'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'agar-agar powder (red algae hydrocolloid)',
      ratio: '1:1 powder (or 1 tsp agar per 1 gelatin sheet)',
      ratioMultiplier: 1,
      prepTip: 'Unlike gelatin, agar MUST simmer for 2-3 minutes to fully hydrate and activate before setting.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'cornstarch or arrowroot slurry (for soft spoonable puddings & panna cotta)',
        ratio: '2 tbsp starch per 1 tbsp gelatin',
        ratioMultiplier: 2,
        prepTip: 'Gives a softer creamy custard wobble rather than agar’s firm jelly snap.',
        allergens: [],
      },
    ],
    chemistryRoles: ['binding', 'texture'],
    chemistryNote: 'Agarose polymers form a thermoreversible gel at room temperature (~100°F), setting firmer and staying stable even in warm kitchens.',
    technique: {
      moisture: 'Always boil agar-agar in liquid for 2 full minutes; never sprinkle into cold liquid without boiling.',
    },
    flavorPairings: ['vanilla', 'citrus zest', 'coconut cream'],
  },
  {
    id: 'milk-chocolate',
    name: 'Milk Chocolate / White Chocolate',
    aliases: ['milk chocolate chips', 'milk chocolate', 'white chocolate chips', 'white chocolate'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'dairy-free oat-milk chocolate or 60-70% dark couverture chocolate',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Check label for milk fat/whey; oat-milk chocolate replicates creamy sweetness directly.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: '70% dark chocolate + 1 tbsp oat cream per 4 oz melted chocolate',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Softens bittersweet snap into velvety ganache or chunks.',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'texture'],
    chemistryNote: 'Cocoa butter crystals govern snap and melt-in-mouth smoothness; oat milk powder substitutes milk solids cleanly.',
    technique: {
      fat: 'Melt gently over a double boiler (bain-marie) so cocoa butter does not seize.',
    },
    flavorPairings: ['espresso powder', 'flaky sea salt', 'vanilla'],
  },
  {
    id: 'white-sugar',
    name: 'Refined White Sugar (Bone-Char Check)',
    aliases: ['granulated white sugar', 'white sugar', 'powdered sugar', 'confectioners sugar'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'organic unbleached cane sugar (certified bone-char-free) or beet sugar',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'USDA Organic cane sugar and beet sugar are never filtered through bone char.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'coconut sugar or maple sugar (deeper caramel flavor)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Darkens light batters slightly with toffee undertones.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'maillard'],
    chemistryNote: 'Sucrose crystals aerate fats during creaming and tenderize baked crumb by binding free water.',
    technique: {
      maillard: 'Organic cane sugar creams identically to conventional white sugar for cookies and cakes.',
    },
    flavorPairings: ['vanilla bean', 'sea salt'],
  },
  {
    id: 'whey-protein',
    name: 'Whey / Casein Protein Powder',
    aliases: ['whey protein', 'casein protein', 'collagen peptides'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'pea + brown rice complete plant protein blend',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Plant protein absorbs more liquid than whey—add 2-3 tbsp extra plant milk per scoop.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'hemp protein or pumpkin seed protein powder',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Whole-food single-ingredient protein with nutty depth.',
        allergens: [],
      },
    ],
    chemistryRoles: ['binding', 'texture'],
    chemistryNote: 'Combining legume (pea) and cereal (rice) proteins yields a complete essential amino acid profile comparable to whey.',
    technique: {
      moisture: 'Increase hydration by 15-20% when baking with plant protein powders to prevent dry crumb.',
    },
    flavorPairings: ['cinnamon', 'cacao', 'vanilla'],
  },
  {
    id: 'custard-pastry-cream',
    name: 'Pastry Cream / Crème Anglaise',
    aliases: ['pastry cream', 'creme anglaise', 'crème anglaise', 'vanilla custard', 'custard'],
    category: 'eggs-baking',
    primarySwap: {
      ingredient: 'cornstarch-thickened oat-coconut pastry cream with vanilla bean & vegan butter',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Whisk 3 tbsp cornstarch per 2 cups oat milk, boil 1 minute until glossy, then whisk in 2 tbsp cold vegan butter off-heat.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'silken tofu + custard starch + maple vanilla blend',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Delivers rich protein body for tarts and eclairs.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['emulsion', 'texture', 'fat-richness'],
    chemistryNote: 'Gelatinized amylose/amylopectin from cornstarch creates clean sliceable custard without egg coagulation risks.',
    technique: {
      moisture: 'Press parchment directly onto warm pastry cream surface while chilling to prevent skin formation.',
    },
    flavorPairings: ['vanilla bean', 'turmeric (tiny pinch for golden tint)', 'rum'],
  },

  // ================= MEAT & POULTRY (16) =================
  {
    id: 'ground-beef',
    name: 'Ground Beef / Minced Beef',
    aliases: ['ground beef', 'beef mince', 'minced beef', 'hamburger meat', 'ground chuck', 'beef patty', 'beef patties'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'seared walnut-cremini mushroom & black lentil crumble (or pea-protein plant beef)',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'For smash burgers, use pea-protein plant ground formed into loose 3-oz balls and smashed thin on a ripping-hot cast iron skillet.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'brown lentils + finely diced browned cremini mushrooms + 1 tbsp tamari & tomato paste',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Nut-free and gluten-free (with tamari); cook mushrooms dry first to drive off water before browning.',
        allergens: ['soy'],
      },
      {
        ingredient: 'pea-protein plant ground OR toasted sunflower seed + lentil + smoked paprika mince',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: '100% soy-free, nut-free, and gluten-free savory mince with rich Maillard crust.',
        allergens: [],
      },
    ],
    chemistryRoles: ['maillard', 'umami', 'texture', 'fat-richness'],
    chemistryNote: 'Mushrooms contribute guanylates, tomato paste brings glutamates, and cooked lentils/pea protein replicate chewy ground-meat texture.',
    technique: {
      maillard: 'Cook mushrooms and plant mince in a wide skillet without crowding so moisture evaporates and deep browned fond develops.',
      umami: 'Deglaze with 1 tbsp tomato paste + tamari/coconut aminos + 1/2 tsp Marmite or smoked paprika.',
    },
    flavorPairings: ['tamari', 'tomato paste', 'smoked paprika', 'black pepper'],
  },
  {
    id: 'beef-chuck-stew',
    name: 'Beef Chuck / Stew Meat / Brisket',
    aliases: ['beef chuck', 'stew meat', 'beef stew meat', 'beef brisket', 'chuck roast', 'short ribs', 'beef cubes', 'stewing beef'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'thick-cut king oyster mushrooms + seared seitan chunks (or braised jackfruit & chestnut mushrooms)',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Score king oyster mushroom trunks in crosshatch pattern and sear hard in oil before braising in red wine and thyme.',
      allergens: ['gluten'],
    },
    alternatives: [
      {
        ingredient: 'thick-cut king oyster & portobello chunks + braised French green lentils',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Gluten-free, soy-free, and nut-free; holds meaty bite even after a 45-minute wine braise.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'umami', 'maillard'],
    chemistryNote: 'King oyster mushrooms contain dense chitin fibers that never turn mushy during slow braising, soaking up wine and herb reductions like beef.',
    technique: {
      maillard: 'Sear mushroom/seitan pieces in batches at medium-high heat until dark mahogany before adding broth.',
      umami: 'Simmer with 1 dried shiitake or porcini mushroom + 1 tbsp tomato paste to mimic beef collagen richness.',
    },
    flavorPairings: ['dried porcini', 'red wine', 'thyme', 'bay leaf'],
  },
  {
    id: 'steak-sirloin',
    name: 'Steak / Sirloin / Ribeye',
    aliases: ['ribeye steak', 'sirloin steak', 'flank steak', 'skirt steak', 'filet mignon', 'beef steak', 'steak', 'beef strips'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'pressed lion’s mane or portobello steak basted with garlic-thyme vegan butter & tamari',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Press mushrooms under a heavy cast-iron pan while searing to squeeze out water and form dense, steak-like seared fibers.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'pressed lion’s mane mushroom or thick cauliflower-celeriac steak with coconut aminos & black peppercorn crust',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; sear hard and baste with rosemary oil.',
        allergens: [],
      },
    ],
    chemistryRoles: ['maillard', 'texture', 'umami'],
    chemistryNote: 'Pressing whole mushrooms collapses air pockets into dense fibrous flesh that forms a savory crust when basted with aromatics.',
    technique: {
      maillard: 'Use a weighted press during searing for maximum pan contact and deep caramelized crust.',
      fat: 'Finish with a spoonful of garlic-thyme plant butter basted over the hot surface.',
    },
    flavorPairings: ['cracked black pepper', 'rosemary', 'garlic', 'balsamic glaze'],
  },
  {
    id: 'bacon-pancetta',
    name: 'Bacon / Pancetta',
    aliases: ['smoked bacon', 'streaky bacon', 'bacon strips', 'bacon bits', 'pancetta', 'bacon'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'crispy smoked tempeh or shiitake mushroom bacon (tamari, liquid smoke, maple syrup, smoked paprika)',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Slice shiitake caps or tempeh paper-thin, toss with marinade + oil, and roast at 375°F for 15-18 min until shattering crisp.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'crispy smoked shiitake mushroom ribbons or coconut-chip bacon (coconut aminos, smoked paprika, maple)',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; crisps further as it cools for 3 minutes out of the oven.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'maillard', 'fat-richness'],
    chemistryNote: 'Bacon’s signature appeal is smoke phenols + caramelized sugar + salty fat + crisp shatter. Thin roasted shiitakes deliver all four.',
    technique: {
      maillard: 'Pull from oven right as edges darken—sugar in maple glaze burns fast, and crispness sets as steam escapes.',
      umami: 'Use 1/4 tsp hickory liquid smoke + 1 tsp smoked paprika for unmistakable smokehouse aroma.',
    },
    flavorPairings: ['liquid smoke', 'smoked paprika', 'maple syrup', 'black pepper'],
  },
  {
    id: 'guanciale',
    name: 'Guanciale / Salt Pork / Lardons',
    aliases: ['guanciale', 'salt pork', 'pork lardons', 'lardons', 'pork belly'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'diced king oyster mushroom lardons seared crisp with smoked paprika, olive oil & white miso',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Cube king oyster stems into 1/4-inch lardons, render in olive oil with cracked pepper until deeply golden, then glaze with miso.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'diced king oyster mushroom lardons with chickpea miso, smoked paprika & cracked black pepper',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; renders savory peppered oil straight into carbonara or stews.',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'umami', 'texture'],
    chemistryNote: 'Guanciale renders peppered fat while staying chewy-crisp. Diced king oyster stems sautéed in olive oil emulate both texture and seasoned fat base.',
    technique: {
      fat: 'Bloom coarse black pepper directly in the seasoned oil left in the pan after crisping the mushroom lardons.',
    },
    flavorPairings: ['cracked black pepper', 'smoked paprika', 'olive oil'],
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast / Cutlets',
    aliases: ['boneless skinless chicken breast', 'chicken breasts', 'chicken breast', 'chicken cutlets', 'chicken tenders', 'shredded chicken', 'diced chicken'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'frozen-and-thawed extra-firm tofu chunks (pressed & torn) OR seared soy curls',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Freezing and thawing tofu creates ice-crystal pockets that give it fibrous, meaty chew and sponge-like sauce absorption.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'torn king oyster mushrooms + roasted chickpeas (or chickpea tofu)',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; hand-shred mushroom stems with a fork for pulled-chicken strands.',
        allergens: [],
      },
      {
        ingredient: 'seitan chicken-style cutlets simmered in poultry-herb broth',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Highest protein density (~22g per serving) with taut bite.',
        allergens: ['gluten'],
      },
    ],
    chemistryRoles: ['texture', 'maillard'],
    chemistryNote: 'Hand-tearing pressed tofu or shredding king oyster stems creates ragged surface area that catches spice rubs and browns crisply.',
    technique: {
      maillard: 'Dust pieces lightly with 1 tbsp cornstarch or arrowroot before pan-searing or roasting at 425°F for a golden exterior.',
      umami: 'Season with poultry herbs (thyme, sage, marjoram) + nutritional yeast to evoke roasted chicken.',
    },
    flavorPairings: ['cornstarch', 'thyme', 'garlic', 'lemon'],
  },
  {
    id: 'chicken-thighs',
    name: 'Chicken Thighs / Dark Meat Poultry',
    aliases: ['boneless chicken thighs', 'chicken thighs', 'chicken thigh', 'chicken drumsticks', 'roast chicken', 'chicken'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'marinated torn extra-firm tofu & oyster mushrooms roasted at 425°F',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Oyster mushroom clusters mimic dark-meat juiciness; roast until edges char slightly for tandoori or butter-chicken authenticity.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'roasted cauliflower florets + golden chickpeas + torn oyster mushrooms',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; soaks up rich spiced tomato-cream gravies effortlessly.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'fat-richness', 'maillard'],
    chemistryNote: 'Dark poultry meat stays succulent due to intramuscular fat; tossing tofu or mushrooms with a tablespoon of oil and spiced yogurt replicates that juiciness.',
    technique: {
      maillard: 'Char marinated pieces under the broiler for 3 minutes before folding into simmering sauce.',
    },
    flavorPairings: ['garam masala', 'ginger', 'smoked paprika'],
  },
  {
    id: 'pork-shoulder',
    name: 'Pork Shoulder / Pulled Pork / Carnitas',
    aliases: ['pork shoulder', 'pulled pork', 'pork butt', 'carnitas', 'pork tenderloin', 'pork chops', 'pork'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'young green jackfruit (canned in brine) shredded with sautéed oyster mushrooms',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Rinse green jackfruit thoroughly, press dry, shred with two forks, and crisp in a hot skillet before saucing.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'rehydrated soy curls sautéed with cumin, orange juice & liquid smoke',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Adds 15g+ protein per serving alongside shredded carnitas texture.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['texture', 'maillard'],
    chemistryNote: 'Young jackfruit’s fibrous carpels naturally pull apart into tender pork-like shreds while taking on any braising liquid.',
    technique: {
      moisture: 'Cook off brine moisture completely in a hot pan before adding BBQ or citrus glaze so jackfruit caramelizes instead of steaming.',
    },
    flavorPairings: ['orange juice', 'cumin', 'smoked paprika', 'apple cider vinegar'],
  },
  {
    id: 'sausage-chorizo',
    name: 'Sausage / Italian Sausage / Chorizo',
    aliases: ['italian sausage', 'pork sausage', 'breakfast sausage', 'chorizo', 'kielbasa', 'andouille', 'bratwurst', 'sausage'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'spiced lentil-walnut or plant-based sausage crumble (fennel seed, smoked paprika, sage, garlic)',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Sausage flavor lives 90% in the spice profile: toasted crushed fennel + red pepper flakes for Italian; ancho chili + cumin + vinegar for chorizo.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'pea-protein vegan sausage OR spiced black bean & toasted pepita chorizo crumble',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; crisp in olive oil with apple cider vinegar.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'maillard', 'fat-richness'],
    chemistryNote: 'Whole toasted spices (fennel, sage, guajillo/smoked paprika) dissolved in warm oil recreate authentic sausage character.',
    technique: {
      fat: 'Bloom ground spices in 1 tbsp oil with tomato paste before browning the crumbles.',
    },
    flavorPairings: ['fennel seed', 'smoked paprika', 'sage', 'apple cider vinegar'],
  },
  {
    id: 'ground-turkey',
    name: 'Ground Turkey / Ground Chicken',
    aliases: ['ground turkey', 'ground chicken', 'turkey mince', 'chicken mince'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'crumbled extra-firm tofu + finely chopped white button mushrooms + poultry herbs',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Bake crumbled seasoned tofu at 375°F for 20 min to remove excess water and build bouncy mince texture.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'red/green lentils + finely diced cauliflower rice & mushrooms',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free lean savory mince for tacos, meatballs, and chili.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'binding'],
    chemistryNote: 'Lean poultry mince benefits from gentle oil addition and umami seasoning so meatballs and sauces stay juicy.',
    technique: {
      moisture: 'Bind vegan meatballs with 1 tbsp ground flax + 2 tbsp breadcrumbs (or oat flour for GF).',
    },
    flavorPairings: ['sage', 'garlic powder', 'nutritional yeast'],
  },
  {
    id: 'pepperoni-salami',
    name: 'Pepperoni / Salami / Prosciutto',
    aliases: ['pepperoni', 'salami', 'prosciutto', 'chorizo slices', 'deli ham', 'ham'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'thin-sliced smoked beet or seitan pepperoni glazed with fennel, anise, paprika & chili oil',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Brush slices with spiced paprika oil before baking on pizza so edges curl and crisp.',
      allergens: ['gluten'],
    },
    alternatives: [
      {
        ingredient: 'thin-sliced roasted spiced king oyster rounds or sun-dried tomatoes tossed in smoked paprika oil',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Gluten-free, soy-free, nut-free chewy salty-spicy slices.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'fat-richness', 'acid-tang'],
    chemistryNote: 'Cured salumi combines lactic fermentation tang, fennel/anise aromatics, and concentrated salt.',
    technique: {
      maillard: 'Place on top of cheese before high-heat baking so edges char slightly.',
    },
    flavorPairings: ['fennel', 'smoked paprika', 'red pepper flakes'],
  },
  {
    id: 'lamb',
    name: 'Lamb / Mutton',
    aliases: ['ground lamb', 'lamb shoulder', 'lamb stew', 'lamb chops', 'lamb'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'roasted eggplant cubes + braised beluga lentils + charred portobello mushrooms',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Season boldly with rosemary, mint, cumin, coriander, and pomegranate molasses for rich earthy lamb depth.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'seitan chunks braised in rosemary, garlic, and red wine',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Delivers substantial meaty chew for gyros and stews.',
        allergens: ['gluten'],
      },
    ],
    chemistryRoles: ['umami', 'texture'],
    chemistryNote: 'Roasted eggplant provides velvety fat absorption while lentils and herbs deliver rich earthy savoriness.',
    technique: {
      maillard: 'Roast salted eggplant at 450°F until collapsed and caramelized before simmering in curry or stew.',
    },
    flavorPairings: ['rosemary', 'cumin', 'mint', 'coriander'],
  },
  {
    id: 'duck',
    name: 'Duck / Roasted Duck',
    aliases: ['duck breast', 'roast duck', 'duck confit', 'duck'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'five-spice glazed braised king oyster mushrooms & crispy yuba (tofu skin)',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Crisp layered yuba sheets in oil for lacquered Peking-style skin.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'five-spice roasted king oyster & maitake mushrooms with orange-maple glaze',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free; crisp edges mimic roast duck.',
        allergens: [],
      },
    ],
    chemistryRoles: ['maillard', 'fat-richness'],
    chemistryNote: 'Chinese five-spice, sweet citrus glaze, and crisp pan-fried surface capture roasted duck’s signature sweet-savory crunch.',
    technique: {
      maillard: 'Brush glaze on during the final 3 minutes of roasting so sugars lacquer without scorching.',
    },
    flavorPairings: ['five-spice powder', 'orange zest', 'hoisin'],
  },
  {
    id: 'lard-tallow',
    name: 'Lard / Beef Tallow / Duck Fat / Chicken Fat (Schmaltz)',
    aliases: ['beef tallow', 'pork lard', 'duck fat', 'chicken fat', 'schmaltz', 'bacon grease', 'bacon fat', 'tallow', 'lard'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'refined coconut oil + olive oil (1:1 blend) infused with caramelized shallots & smoked salt',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'For pastry/tamales, use solid chilled refined coconut oil or palm-free vegetable shortening; for roasting potatoes, use olive oil + garlic.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'high-oleic sunflower or avocado oil + 1 tsp toasted onion oil',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Slowly fry minced shallots in oil until golden, then strain for savory "plant schmaltz".',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'maillard'],
    chemistryNote: 'Saturated solid fats create flaky pastry strata; infusing neutral oil with browned alliums restores savory roasted-fat aroma.',
    technique: {
      fat: 'Infuse warm oil with sliced shallots and thyme for 10 minutes on low heat to recreate schmaltz or rendered fat depth.',
    },
    flavorPairings: ['shallots', 'smoked sea salt', 'thyme'],
  },
  {
    id: 'bone-marrow',
    name: 'Bone Marrow / Pork Bones (Ramen & Broths)',
    aliases: ['pork bones', 'beef bones', 'marrow bones', 'bone marrow', 'chicken carcass'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'roasted kombu + dried shiitake + white sesame tahini + unsweetened soy/oat milk emulsion',
      ratio: '1 tbsp tahini + 1/2 cup oat milk + 4 dried shiitakes per quart broth',
      ratioMultiplier: 1,
      prepTip: 'For creamy Tonkotsu ramen broth, simmer charred onion, ginger, garlic, kombu, and shiitakes, then whisk in tahini and oat milk.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'roasted chestnut mushrooms + miso + 1 tbsp refined coconut oil emulsified into broth',
        ratio: '1:1 broth yield',
        ratioMultiplier: 1,
        prepTip: 'Immersion-blending a small amount of fat + garlic into hot broth creates milky Tonkotsu lip-coating richness.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['emulsion', 'umami', 'fat-richness'],
    chemistryNote: 'Tonkotsu’s creamy opacity comes from emulsified lipids and gelatin. Blending tahini or oat cream with roasted garlic and kombu reproduces both body and glutamate-guanylate synergy.',
    technique: {
      umami: 'Steep kombu below a rolling boil (175°F) for 20 min, remove before boiling, and combine with shiitake soaking liquid for 8x synergistic umami.',
    },
    flavorPairings: ['kombu', 'dried shiitake', 'white tahini', 'roasted garlic'],
  },
  {
    id: 'meatballs',
    name: 'Meatballs / Meatloaf',
    aliases: ['beef meatballs', 'pork meatballs', 'meatballs', 'meatloaf'],
    category: 'meat-poultry',
    primarySwap: {
      ingredient: 'roasted mushroom, brown lentil & oat-walnut meatballs with flax binder',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Chill shaped balls 15 minutes before baking at 400°F so starches firm up and stay intact in marinara.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'lentil, sautéed cremini mushroom & rolled oat meatballs with tomato paste',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, and gluten-free when using certified GF rolled oats.',
        allergens: [],
      },
    ],
    chemistryRoles: ['binding', 'umami', 'texture'],
    chemistryNote: 'Oat beta-glucans and flax mucilage bind mashed lentils and browned mushrooms into tender, sliceable spheres.',
    technique: {
      moisture: 'Sauté mushrooms and onions dry before mixing so excess steam never cracks the meatballs.',
    },
    flavorPairings: ['fennel', 'oregano', 'nutritional yeast', 'tomato paste'],
  },

  // ================= SEAFOOD (10) =================
  {
    id: 'clams',
    name: 'Clams / Mussels / Oysters',
    aliases: ['chopped clams', 'minced clams', 'canned clams', 'littleneck clams', 'clam juice', 'clams', 'mussels', 'oysters'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'diced king oyster mushroom stems + crumbled nori/kelp + briny vegetable broth',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Simmer diced king oyster stems with a 2-inch strip of kombu, 1 tsp Old Bay or celery seed, and 1 tbsp white wine for chewy oceanic bites.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'hearts of palm + chopped oyster mushrooms simmered in kombu-dulse broth',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Delivers both delicate snap and briny chowder depth with zero allergens.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'umami'],
    chemistryNote: 'Marine algae (kombu, dulse, nori) supply the exact bromophenols and sea minerals responsible for shellfish aroma; king oyster stems provide tender clam chew.',
    technique: {
      umami: 'Infuse broth with kombu or 1 tsp dulse flakes and a splash of dry white wine to replace clam juice.',
    },
    flavorPairings: ['kombu', 'dulse flakes', 'white wine', 'bay leaf', 'thyme'],
  },
  {
    id: 'shrimp',
    name: 'Shrimp / Prawns',
    aliases: ['jumbo shrimp', 'raw shrimp', 'cooked shrimp', 'prawns', 'shrimp'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'curved king oyster mushroom medallions (or konjac plant shrimp) marinated in kelp, garlic & lemon',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Cut king oyster stems lengthwise and score shallow ridges, then pan-sear fast with garlic, lemon, and pinch of kelp granules.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'konjac-starch vegan shrimp (for snappy bounce in stir-fries and scampi)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Pat dry and sear briefly over high heat with garlic butter and white wine.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'umami'],
    chemistryNote: 'Konjac glucomannan gels and firm king oyster mushrooms mimic shrimp’s snappy springiness while kelp brings clean ocean brine.',
    technique: {
      maillard: 'Sear over high heat for just 2 minutes per side so texture stays firm and snappy.',
    },
    flavorPairings: ['kelp granules', 'garlic', 'lemon', 'parsley'],
  },
  {
    id: 'salmon',
    name: 'Salmon (Fillet or Smoked Lox)',
    aliases: ['smoked salmon', 'salmon fillets', 'salmon fillet', 'salmon', 'lox'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'marinated roasted carrot lox (for smoked) OR scored tofu fillets wrapped in nori sheet with beetroot-miso glaze',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Salt-roast carrots or score firm tofu, wrap bottom with nori "skin", and pan-sear crisp with lemon-dill sauce.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'ribboned roasted carrots cured in kelp, liquid smoke, lemon, dill & caper brine',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free smoked lox texture.',
        allergens: [],
      },
    ],
    chemistryRoles: ['fat-richness', 'umami', 'texture'],
    chemistryNote: 'Omega-rich oil (flax or olive), kelp sea minerals, and nori skin deliver salmon’s flaky-silky richness.',
    technique: {
      maillard: 'Crisp the nori-wrapped side face down in hot oil for 3 minutes until lacy and crunchy.',
    },
    flavorPairings: ['nori', 'fresh dill', 'capers', 'lemon'],
  },
  {
    id: 'tuna',
    name: 'Tuna (Canned or Sashimi)',
    aliases: ['canned tuna', 'tuna salad', 'ahi tuna', 'tuna'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'mashed chickpeas with diced celery, red onion, crushed nori, dill, lemon & vegan mayo',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Coarsely mash 75% of the chickpeas with a fork so flaky chunks remain; fold in 1/2 sheet finely crumbled nori.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'shredded jackfruit + mashed white beans + dulse flakes & capers',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Produces long flaky strands ideal for tuna melts.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'umami'],
    chemistryNote: 'Partially smashed chickpeas hold dressing like flaked albacore while nori and capers supply crisp marine salinity.',
    technique: {
      moisture: 'Drain and pat chickpeas dry before mashing so tuna salad stays fluffy, not soggy.',
    },
    flavorPairings: ['crumbled nori', 'capers', 'celery', 'dill', 'Dijon'],
  },
  {
    id: 'white-fish',
    name: 'White Fish (Cod / Halibut / Tilapia)',
    aliases: ['cod fillets', 'white fish', 'halibut', 'tilapia', 'haddock', 'pollock', 'fish fillets', 'fish'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'hearts of palm or banana blossom marinated in kombu-lemon brine (beer-battered or pan-seared)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Banana blossom’s natural petal layers flake apart identically to battered cod inside fish tacos or fish & chips.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'pressed firm tofu slabs scored and wrapped with nori sheet',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Holds firm in curries and pan-frying.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['texture', 'umami'],
    chemistryNote: 'Banana blossom bracts separate into tender flaky petals that replicate white fish muscle myotomes.',
    technique: {
      maillard: 'Use sparkling water or light beer in batter and fry at 365°F for a shattering crisp golden crust.',
    },
    flavorPairings: ['nori', 'Old Bay seasoning', 'lemon', 'tartar sauce'],
  },
  {
    id: 'crab-meat',
    name: 'Crab Meat (Crab Cakes / Rolls)',
    aliases: ['lump crab meat', 'crab meat', 'crabmeat', 'imitation crab', 'crab'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'shredded hearts of palm + finely diced artichoke hearts + Old Bay seasoning & kelp',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Press liquid out of hearts of palm, shred with forks into sweet lump flakes, and bind cakes with vegan mayo and breadcrumbs.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'shredded lion’s mane mushroom + celery + Old Bay + lemon zest',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Lion’s mane naturally tastes delicately sweet and shellfish-like when pan-seared in plant butter.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'umami'],
    chemistryNote: 'Hearts of palm and lion’s mane share crab’s delicate sweetness and tender, flaky strand geometry.',
    technique: {
      moisture: 'Squeeze shredded hearts of palm in a clean kitchen towel so crab cakes hold together cleanly in the skillet.',
    },
    flavorPairings: ['Old Bay seasoning', 'lemon zest', 'chives', 'Dijon mustard'],
  },
  {
    id: 'scallops',
    name: 'Sea Scallops',
    aliases: ['sea scallops', 'bay scallops', 'scallops'],
    category: 'seafood',
    primarySwap: {
      ingredient: '1-inch thick king oyster mushroom stem medallions scored in a diamond crosshatch',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Simmer medallions 5 min in kombu-white wine broth, pat bone dry, and sear hard in oil until deeply golden brown on both faces.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'thick hearts of palm rounds seared in garlic-lemon plant butter',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Fast weeknight scallop medallion alternative.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'maillard'],
    chemistryNote: 'King oyster stems have the exact cylindrical geometry and velvety-springy bite of seared sea scallops.',
    technique: {
      maillard: 'Blot bone-dry after marinating and avoid moving medallions for 3 full minutes so a caramelized crust forms.',
    },
    flavorPairings: ['kombu', 'dry white wine', 'garlic', 'lemon'],
  },
  {
    id: 'anchovies',
    name: 'Anchovies / Anchovy Paste',
    aliases: ['anchovy fillets', 'anchovy paste', 'anchovies', 'anchovy'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'finely minced capers + caper brine + 1/2 tsp white miso + pinch crumbled nori',
      ratio: '1 tsp capers + 1/2 tsp miso per 2 anchovy fillets',
      ratioMultiplier: 1,
      prepTip: 'Mash capers, garlic, miso, and a pinch of nori into a paste before whisking into Caesar dressing or puttanesca.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'minced capers + briny kalamata olive + pinch of dulse/nori flakes',
        ratio: '1 tsp capers + 1 olive per 2 fillets',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free briny umami bomb.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'acid-tang'],
    chemistryNote: 'Anchovies supply dissolved glutamates, salt, and sea brine. Capers + fermented miso + seaweed hit all three flavor receptors.',
    technique: {
      umami: 'Bloom minced capers and nori in warm olive oil for pasta sauces, or blend directly into cold dressings.',
    },
    flavorPairings: ['capers', 'white miso', 'nori', 'garlic', 'lemon'],
  },
  {
    id: 'lobster',
    name: 'Lobster',
    aliases: ['lobster tail', 'lobster meat', 'lobster'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'chunks of lion’s mane & king oyster mushroom poached in tarragon-kelp vegan butter',
      ratio: '1:1 by weight',
      ratioMultiplier: 1,
      prepTip: 'Poach gently in seasoned plant butter with paprika and lemon so chunks absorb sweet richness.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'chunks of hearts of palm tossed in lemon-tarragon vegan butter & Old Bay',
        ratio: '1:1 by weight',
        ratioMultiplier: 1,
        prepTip: 'Ideal chilled for New England-style lobster rolls.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'fat-richness'],
    chemistryNote: 'Sweet butter poaching and tarragon aromatics carry lobster’s luxury profile over dense mushroom or hearts-of-palm chunks.',
    technique: {
      fat: 'Gently warm in cultured plant butter with a squeeze of lemon rather than high-heat frying.',
    },
    flavorPairings: ['tarragon', 'cultured vegan butter', 'lemon', 'paprika'],
  },
  {
    id: 'squid-calamari',
    name: 'Squid / Calamari',
    aliases: ['calamari rings', 'calamari', 'squid'],
    category: 'seafood',
    primarySwap: {
      ingredient: 'cored king oyster mushroom rings dusted in seasoned cornstarch & kelp',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Slice king oyster stems into 1/2-inch rounds and punch out centers with a small bottle cap to create authentic rings.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'thick hearts of palm rings battered and crisp-fried',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Naturally separates into concentric rings when sliced.',
        allergens: [],
      },
    ],
    chemistryRoles: ['texture', 'maillard'],
    chemistryNote: 'Sliced king oyster rings maintain a tender-chewy snap inside crisp fried batter.',
    technique: {
      maillard: 'Fry coated rings at 375°F for 2-3 minutes and serve immediately with lemon wedges.',
    },
    flavorPairings: ['kelp powder', 'lemon', 'marinara', 'parsley'],
  },

  // ================= STOCKS, SAUCES & CONDIMENTS (12) =================
  {
    id: 'chicken-broth',
    name: 'Chicken Broth / Chicken Stock',
    aliases: ['low-sodium chicken broth', 'chicken stock', 'chicken broth', 'chicken bouillon'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'savory golden vegetable broth + 1 tsp nutritional yeast & pinch of thyme/turmeric per cup',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Or use vegan "no-chicken" bouillon paste for instant golden poultry flavor.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'kombu-onion-celery broth + 1 tsp white/chickpea miso stirred in off-heat',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Adds clean savory body without overpowering delicate soups.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami'],
    chemistryNote: 'Chicken stock provides mild savory warmth and golden color; vegetable stock boosted with nutritional yeast and thyme matches its profile.',
    technique: {
      umami: 'Boost boxed vegetable stock with 1 tsp nutritional yeast or miso paste per 2 cups so soups never taste flat.',
    },
    flavorPairings: ['nutritional yeast', 'thyme', 'bay leaf', 'turmeric'],
  },
  {
    id: 'beef-broth',
    name: 'Beef Broth / Beef Stock / Bone Broth',
    aliases: ['low-sodium beef broth', 'beef bone broth', 'beef stock', 'beef broth', 'bone broth', 'beef bouillon'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'dark mushroom-shiitake broth + 1 tbsp tamari & 1 tsp tomato paste per 2 cups',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Steep 4 dried shiitake or porcini mushrooms in hot vegetable broth for 15 minutes for deep dark-roast richness.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'roasted mushroom broth + 1 tbsp coconut aminos + 1/2 tsp yeast extract (Marmite/Vegemite) or tomato paste',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free dark savory stock ideal for French onion soup and beef stew.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'maillard'],
    chemistryNote: 'Dried mushrooms supply guanylate nucleotides that amplify roasted vegetable glutamates, creating dark meaty broth depth.',
    technique: {
      umami: 'Caramelize tomato paste for 2 minutes in the pot before pouring in mushroom broth to build deep fond.',
    },
    flavorPairings: ['dried shiitake', 'porcini', 'tomato paste', 'thyme'],
  },
  {
    id: 'fish-sauce',
    name: 'Fish Sauce (Nuoc Mam / Nam Pla)',
    aliases: ['thai fish sauce', 'vietnamese fish sauce', 'fish sauce'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'vegan kelp-shiitake soy sauce (tamari simmered with kombu, dried shiitake & rice vinegar)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Quick swap: 1 tbsp tamari + 1/2 tsp rice vinegar + pinch crushed nori or kelp.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'coconut aminos + 1/2 tsp sea salt + pinch kelp granules + 1/2 tsp lime juice',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free pungent salty finisher for Thai curries and pad thai.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'acid-tang'],
    chemistryNote: 'Fish sauce is fermented marine amino acids. Pairing fermented soy/coconut aminos with seaweed mimics its intense savory funk.',
    technique: {
      umami: 'Add near the end of cooking with fresh lime juice to brighten stir-fries and curries.',
    },
    flavorPairings: ['lime juice', 'kelp', 'garlic', 'Thai chili'],
  },
  {
    id: 'oyster-sauce',
    name: 'Oyster Sauce',
    aliases: ['oyster sauce'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'vegetarian mushroom stir-fry sauce (shiitake extract, soy sauce, brown sugar, cornstarch)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'DIY quick swap: 1 tbsp tamari + 1 tsp brown sugar + 1/2 tsp mushroom powder + 1/2 tsp cornstarch.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'coconut aminos + 1/2 tsp shiitake powder + 1/2 tsp arrowroot + pinch salt',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free and gluten-free glossy stir-fry glaze.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'maillard'],
    chemistryNote: 'Oyster sauce balances thick glossy caramelization with concentrated shellfish umami—shiitake extract hits the same savory note.',
    technique: {
      maillard: 'Toss into a screaming-hot wok for the final 60 seconds so the sauce glazes vegetables cleanly.',
    },
    flavorPairings: ['shiitake powder', 'ginger', 'sesame oil'],
  },
  {
    id: 'worcestershire',
    name: 'Worcestershire Sauce (Contains Anchovies)',
    aliases: ['worcestershire sauce', 'worcestershire'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'vegan Worcestershire sauce (tamarind, molasses, vinegar, cloves) OR 1 tbsp tamari + 1 tsp tamarind/balsamic + pinch allspice',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Most classic brands contain anchovies; check for certified vegan bottles or mix tamari + balsamic + molasses.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: '1 tbsp coconut aminos + 1 tsp apple cider vinegar + 1/2 tsp molasses + pinch clove/garlic',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, gluten-free, nut-free tangy-sweet umami splash.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami', 'acid-tang'],
    chemistryNote: 'Tamarind pulp, vinegar, molasses, and warm spices create Worcestershire’s unmistakable tangy depth without anchovies.',
    technique: {
      umami: 'Use to deglaze seared mushrooms, burgers, and Bloody Marys.',
    },
    flavorPairings: ['tamarind', 'molasses', 'black pepper'],
  },
  {
    id: 'caesar-dressing',
    name: 'Caesar Dressing',
    aliases: ['caesar dressing', 'caesar salad dressing'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'creamy cashew-tahini Caesar (soaked cashews or tahini, lemon, garlic, Dijon, capers, white miso, black pepper)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Blend capers + brine, roasted or raw garlic, lemon juice, Dijon, and nutritional yeast for bold restaurant-grade zing.',
      allergens: ['nuts', 'soy'],
    },
    alternatives: [
      {
        ingredient: 'creamy tahini-lemon Caesar (tahini, lemon juice, garlic, Dijon, minced capers, nutritional yeast, olive oil)',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: '100% nut-free, soy-free, and gluten-free; thins smoothly with cold water.',
        allergens: [],
      },
    ],
    chemistryRoles: ['emulsion', 'umami', 'acid-tang'],
    chemistryNote: 'Tahini or cashew emulsion replaces egg yolk while capers + Dijon + lemon + nutritional yeast deliver the exact Caesar flavor triangle.',
    technique: {
      fat: 'Whisk cold water 1 tbsp at a time into tahini-lemon dressings until the paste turns pale, fluffy, and pourable.',
    },
    flavorPairings: ['capers', 'Dijon mustard', 'lemon', 'garlic'],
  },
  {
    id: 'hollandaise',
    name: 'Hollandaise / Béarnaise Sauce',
    aliases: ['hollandaise sauce', 'bearnaise sauce', 'béarnaise sauce', 'hollandaise'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'blended cashew-lemon hollandaise with melted vegan butter, Dijon, turmeric & pinch kala namak',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Blend hot water, cashews, vegan butter, lemon juice, Dijon, turmeric, and kala namak—zero risk of curdling.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'silken tofu + melted vegan butter + lemon juice + Dijon + turmeric + kala namak',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Nut-free, gluten-free silky golden sauce.',
        allergens: ['soy'],
      },
      {
        ingredient: 'oat-cream + vegan butter + cornstarch-thickened lemon emulsion + kala namak',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Nut-free, soy-free, and gluten-free.',
        allergens: [],
      },
    ],
    chemistryRoles: ['emulsion', 'fat-richness', 'acid-tang'],
    chemistryNote: 'Emulsifying cultured vegan butter with a starchy/creamy base + lemon + kala namak creates glossy, pourable hollandaise that holds warm without breaking.',
    technique: {
      fat: 'Keep warm over a low water bath; whisk in 1 tbsp hot water if it thickens upon standing.',
    },
    flavorPairings: ['lemon juice', 'cayenne', 'kala namak', 'tarragon'],
  },
  {
    id: 'dashi-bonito',
    name: 'Dashi / Bonito Flakes (Katsuobushi)',
    aliases: ['bonito flakes', 'katsuobushi', 'dashi stock', 'dashi powder', 'dashi'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'shojin kombu & dried shiitake dashi (cold-steeped 4 hrs or gently heated to 175°F)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Traditional Buddhist temple stock (shojin ryori): 1 piece kombu + 4 dried shiitakes per 4 cups water; remove kombu before boiling.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'kombu + smoked paprika pinch + white miso broth',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Adds subtle smoked depth reminiscent of dried bonito.',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['umami'],
    chemistryNote: 'Kombu provides L-glutamate and shiitakes provide 5’-guanylate; together they trigger synergistic umami amplification identical to kombu + bonito inosinate.',
    technique: {
      umami: 'Never boil kombu vigorously or it releases bitter tannins—pull the kelp strip just as tiny bubbles line the pot.',
    },
    flavorPairings: ['kombu', 'dried shiitake', 'miso', 'mirin'],
  },
  {
    id: 'demi-glace',
    name: 'Demi-Glace / Pan Gravy',
    aliases: ['demi-glace', 'demi glace', 'beef gravy', 'brown gravy', 'chicken gravy'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'roasted mirepoix & dried porcini reduction thickened with dark roux (or arrowroot) & balsamic',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Roast onion, carrot, celery, and cremini trimmings dark brown with tomato paste before simmering and straining.',
      allergens: [],
    },
    alternatives: [
      {
        ingredient: 'mushroom-tamari reduction mounted with cold vegan butter',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Whisking 1 tbsp cold vegan butter in off-heat creates classic French glossy sheen (monter au beurre).',
        allergens: ['soy'],
      },
    ],
    chemistryRoles: ['umami', 'maillard', 'emulsion'],
    chemistryNote: 'Deeply roasted root vegetables + caramelized tomato paste + mushrooms produce gelatinous body and mirror-gloss sauce.',
    technique: {
      maillard: 'Toast flour in oil to a hazelnut-brown roux (or use cornstarch for GF) for nutty roasted gravy character.',
    },
    flavorPairings: ['dried porcini', 'thyme', 'balsamic vinegar', 'red wine'],
  },
  {
    id: 'shrimp-paste',
    name: 'Shrimp Paste (Belacan / Kapi)',
    aliases: ['shrimp paste', 'belacan', 'kapi', 'prawn paste'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'fermented black bean paste (or dark red miso) + 1/2 tsp crushed nori + pinch smoked salt',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Dry-toast in the curry paste pan for 30 seconds to release pungent fermented aroma.',
      allergens: ['soy'],
    },
    alternatives: [
      {
        ingredient: 'chickpea miso + 1/2 tsp dulse flakes + 1/2 tsp tamarind paste',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Soy-free, nut-free, gluten-free funky Southeast Asian umami anchor.',
        allergens: [],
      },
    ],
    chemistryRoles: ['umami'],
    chemistryNote: 'Fermented legume pastes provide pungent amino-acid funk while toasted seaweed adds marine top-notes.',
    technique: {
      umami: 'Fry the paste together with shallots, lemongrass, and galangal in oil to bloom aromatics.',
    },
    flavorPairings: ['lemongrass', 'galangal', 'nori', 'tamarind'],
  },
  {
    id: 'pesto',
    name: 'Traditional Pesto (Contains Parmesan)',
    aliases: ['basil pesto', 'pesto sauce', 'pesto'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'plant-based basil pesto (fresh basil, toasted pine nuts, olive oil, garlic, nutritional yeast, lemon)',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Add 1 tbsp white miso or 2 tbsp nutritional yeast to replace aged parmesan’s salty savoriness.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'nut-free toasted pepita (pumpkin seed) & basil pesto with nutritional yeast and lemon',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Vibrant emerald green, 100% nut-free, soy-free, and gluten-free.',
        allergens: [],
      },
    ],
    chemistryRoles: ['emulsion', 'umami', 'fat-richness'],
    chemistryNote: 'Toasted seeds/nuts emulsify olive oil around crushed basil while nutritional yeast replaces aged cheese glutamates.',
    technique: {
      fat: 'Blanch basil leaves 5 seconds and ice-bath before blending to lock in bright emerald color.',
    },
    flavorPairings: ['nutritional yeast', 'lemon juice', 'garlic', 'pepitas'],
  },
  {
    id: 'alfredo-sauce',
    name: 'Alfredo Sauce',
    aliases: ['alfredo sauce', 'cream sauce', 'bechamel', 'béchamel'],
    category: 'stocks-sauces',
    primarySwap: {
      ingredient: 'velvety roasted-garlic cashew & cauliflower Alfredo with nutritional yeast, lemon & white pepper',
      ratio: '1:1',
      ratioMultiplier: 1,
      prepTip: 'Steaming cauliflower florets with soaked cashews and blending with pasta water creates ultra-creamy, clingy sauce.',
      allergens: ['nuts'],
    },
    alternatives: [
      {
        ingredient: 'steamed cauliflower + barista oat milk + vegan butter + nutritional yeast + nutmeg',
        ratio: '1:1',
        ratioMultiplier: 1,
        prepTip: 'Nut-free, soy-free, gluten-free velvety white sauce.',
        allergens: [],
      },
    ],
    chemistryRoles: ['emulsion', 'fat-richness', 'umami'],
    chemistryNote: 'Puréed tender cauliflower creates velvety emulsion body with zero graininess when blended with vegan butter and nutmeg.',
    technique: {
      moisture: 'Reserve 1 cup starchy pasta cooking water to thin Alfredo to glossy restaurant consistency.',
    },
    flavorPairings: ['roasted garlic', 'nutmeg', 'white pepper', 'nutritional yeast'],
  },
];
