import React, { useState, useRef, useEffect } from 'react';
import { 
  Leaf, 
  ChefHat, 
  Camera, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles,
  Key,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Trash2,
  Clock,
  ExternalLink,
  Database,
  BookOpen,
  Salad
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { veganifyFood, AIProvider, PromptVibe } from './lib/ai';
import { decryptSettings, encryptSettings, EncryptedPayloadV1 } from './lib/secureSettings';

interface HistoryItem {
  id: string;
  image: string;
  recipe: string;
  timestamp: number;
}

type View = 'home' | 'resources' | 'history' | 'settings' | 'privacy' | 'terms';

interface VeganProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_front_small_url?: string;
  nutriscore_grade?: string;
}

interface VeganMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface VeganApiResource {
  name: string;
  summary: string;
  endpoint: string;
  auth: string;
  docs: string;
}

interface VeganKnowledgeResource {
  title: string;
  value: string;
  sourceLabel: string;
  sourceUrl: string;
}

interface UserSettings {
  provider: AIProvider;
  apiKey: string;
  models: Record<AIProvider, string>;
  vibe: PromptVibe;
  secretSauce: string;
}

const SETTINGS_STORAGE_KEY = 'veganify_settings_v1';
const SETTINGS_SECURE_STORAGE_KEY = 'veganify_settings_secure_v1';
const HISTORY_STORAGE_KEY = 'veganify_history';

const DEFAULT_SETTINGS: UserSettings = {
  provider: 'gemini',
  apiKey: '',
  models: {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini'
  },
  vibe: 'balanced',
  secretSauce: ''
};

const MODEL_PRESETS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini']
};

const VEGAN_API_RESOURCES: VeganApiResource[] = [
  {
    name: 'Open Food Facts',
    summary: 'Open global food product data with vegan tags, nutrition labels, and ingredient text.',
    endpoint: 'https://world.openfoodfacts.org/api/v2/search?categories_tags_en=vegan',
    auth: 'No key required',
    docs: 'https://openfoodfacts.github.io/openfoodfacts-server/api/'
  },
  {
    name: 'TheMealDB',
    summary: 'Simple recipe feed you can filter by category, including vegan recipes.',
    endpoint: 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegan',
    auth: 'No key required',
    docs: 'https://www.themealdb.com/api.php'
  },
  {
    name: 'USDA FoodData Central',
    summary: 'Official US nutrition data for ingredients and packaged foods.',
    endpoint: 'https://api.nal.usda.gov/fdc/v1/foods/search?query=tofu',
    auth: 'Free API key required',
    docs: 'https://fdc.nal.usda.gov/api-guide.html'
  }
];

const VEGAN_KNOWLEDGE_RESOURCES: VeganKnowledgeResource[] = [
  {
    title: 'Vitamin B12',
    value: 'Use fortified foods or supplements regularly on vegan diets.',
    sourceLabel: 'NIH ODS',
    sourceUrl: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/'
  },
  {
    title: 'Iron Absorption',
    value: 'Pair plant iron sources with vitamin C foods to improve absorption.',
    sourceLabel: 'NIH ODS',
    sourceUrl: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/'
  },
  {
    title: 'Calcium',
    value: 'Calcium-set tofu and fortified milks can help cover daily needs.',
    sourceLabel: 'NIH ODS',
    sourceUrl: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/'
  },
  {
    title: 'Protein Sources',
    value: 'Legumes, soy foods, seitan, nuts, and seeds cover protein well.',
    sourceLabel: 'Dietary Guidelines',
    sourceUrl: 'https://www.dietaryguidelines.gov/'
  }
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [secureSettingsEnabled, setSecureSettingsEnabled] = useState(false);
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [settingsPassphrase, setSettingsPassphrase] = useState('');
  const [lockPassphrase, setLockPassphrase] = useState('');
  const [lockPassphraseConfirm, setLockPassphraseConfirm] = useState('');
  const [unlockPassphrase, setUnlockPassphrase] = useState('');
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [veganProducts, setVeganProducts] = useState<VeganProduct[]>([]);
  const [veganMeals, setVeganMeals] = useState<VeganMeal[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
    void loadSettings();
  }, []);

  useEffect(() => {
    if ((view === 'home' || view === 'resources') && !resourcesLoaded && !resourcesLoading) {
      void loadResourceFeeds();
    }
  }, [view, resourcesLoaded, resourcesLoading]);

  const loadResourceFeeds = async () => {
    setResourcesLoading(true);
    setResourcesError(null);
    try {
      const [productsResponse, mealsResponse] = await Promise.all([
        fetch('https://world.openfoodfacts.org/api/v2/search?categories_tags_en=vegan&fields=code,product_name,brands,image_front_small_url,nutriscore_grade&page_size=8'),
        fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegan')
      ]);

      if (!productsResponse.ok || !mealsResponse.ok) {
        throw new Error('Failed to fetch resource feeds');
      }

      const productsJson = (await productsResponse.json()) as { products?: VeganProduct[] };
      const mealsJson = (await mealsResponse.json()) as { meals?: VeganMeal[] };

      setVeganProducts((productsJson.products || []).filter((item) => item.product_name).slice(0, 6));
      setVeganMeals((mealsJson.meals || []).slice(0, 6));
      setResourcesLoaded(true);
    } catch (e) {
      console.error(e);
      setResourcesError('Could not load live vegan resources right now. External APIs may be rate-limited.');
    } finally {
      setResourcesLoading(false);
    }
  };

  const mergeSettings = (parsed: Partial<UserSettings>): UserSettings => ({
    ...DEFAULT_SETTINGS,
    ...parsed,
    models: {
      ...DEFAULT_SETTINGS.models,
      ...(parsed.models || {})
    }
  });

  const persistSettings = async (next: UserSettings) => {
    if (secureSettingsEnabled) {
      if (!settingsUnlocked || !settingsPassphrase) {
        return;
      }
      const payload = await encryptSettings(JSON.stringify(next), settingsPassphrase);
      localStorage.setItem(SETTINGS_SECURE_STORAGE_KEY, JSON.stringify(payload));
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  };

  const loadSettings = async () => {
    const secureSaved = localStorage.getItem(SETTINGS_SECURE_STORAGE_KEY);
    if (secureSaved) {
      setSecureSettingsEnabled(true);
      setSettingsUnlocked(false);
      return;
    }

    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<UserSettings>;
      setSettings(mergeSettings(parsed));
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((current) => {
      const merged: UserSettings = {
        ...current,
        ...partial,
        models: {
          ...current.models,
          ...(partial.models || {})
        }
      };
      void persistSettings(merged);
      return merged;
    });
  };

  const enableSecureSettings = async () => {
    setSecurityError(null);
    if (!lockPassphrase || lockPassphrase.length < 8) {
      setSecurityError('Use a passphrase with at least 8 characters.');
      return;
    }
    if (lockPassphrase !== lockPassphraseConfirm) {
      setSecurityError('Passphrase confirmation does not match.');
      return;
    }

    try {
      const payload = await encryptSettings(JSON.stringify(settings), lockPassphrase);
      localStorage.setItem(SETTINGS_SECURE_STORAGE_KEY, JSON.stringify(payload));
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      setSecureSettingsEnabled(true);
      setSettingsUnlocked(true);
      setSettingsPassphrase(lockPassphrase);
      setLockPassphrase('');
      setLockPassphraseConfirm('');
    } catch (e) {
      console.error(e);
      setSecurityError('Failed to enable encrypted settings.');
    }
  };

  const unlockSecureSettings = async () => {
    setSecurityError(null);
    const secureSaved = localStorage.getItem(SETTINGS_SECURE_STORAGE_KEY);
    if (!secureSaved) {
      setSecurityError('No encrypted settings found.');
      return;
    }

    try {
      const payload = JSON.parse(secureSaved) as EncryptedPayloadV1;
      const decrypted = await decryptSettings(payload, unlockPassphrase);
      const parsed = JSON.parse(decrypted) as Partial<UserSettings>;
      setSettings(mergeSettings(parsed));
      setSettingsUnlocked(true);
      setSettingsPassphrase(unlockPassphrase);
      setUnlockPassphrase('');
    } catch (e) {
      console.error(e);
      setSecurityError('Could not unlock settings. Check your passphrase.');
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  };

  const saveToHistory = (newItem: HistoryItem) => {
    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setRecipe(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    if (secureSettingsEnabled && !settingsUnlocked) {
      setError("Unlock your encrypted settings in Settings before generating.");
      setView('settings');
      return;
    }

    if (!settings.apiKey.trim()) {
      setError("Please provide an API key in Settings to use the AI tool.");
      setView('settings');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const mimeType = image.split(';')[0].split(':')[1];
      
      const result = await veganifyFood(image, mimeType, {
        provider: settings.provider,
        apiKey: settings.apiKey.trim(),
        model: settings.models[settings.provider],
        vibe: settings.vibe,
        secretSauce: settings.secretSauce
      });

      if (result) {
        setRecipe(result);
        saveToHistory({
          id: Date.now().toString(),
          image,
          recipe: result,
          timestamp: Date.now()
        });
      } else {
        throw new Error("Failed to generate recipe.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_INVALID") {
        setError("API key is invalid or expired. Please check your settings.");
        setView('settings');
      } else {
        setError("Something went wrong while veganfying your food. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistStatus('loading');
    setTimeout(() => {
      setWaitlistStatus('success');
      setWaitlistEmail('');
    }, 1500);
  };

  const reset = () => {
    setImage(null);
    setRecipe(null);
    setError(null);
    setView('home');
  };

  const settingsLocked = secureSettingsEnabled && !settingsUnlocked;

  const renderHome = () => (
    <AnimatePresence mode="wait">
      {!image ? (
        <motion.div 
          key="hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center space-y-8 py-12"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider"
            >
              <Sparkles size={14} />
              BYOK Recipe Studio
            </motion.div>
            <h1 className="text-5xl sm:text-7xl font-display font-bold text-stone-900 tracking-tight leading-[1.1]">
              Turn any dish <br />
              <span className="text-brand-600 italic">Plant-Based</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Upload a photo of any non-vegan meal, and our AI will craft a high-quality, professional vegan recipe that mimics the original perfectly.
            </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative max-w-xl mx-auto aspect-video bg-white border-2 border-dashed border-stone-300 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-all overflow-hidden"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
              <Camera size={32} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-stone-900">Click to upload or drag and drop</p>
              <p className="text-sm text-stone-500">PNG, JPG or WEBP (max. 10MB)</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-display font-bold text-stone-400">
              <ChefHat size={20} /> Professional Recipes
            </div>
            <div className="flex items-center gap-2 font-display font-bold text-stone-400">
              <UtensilsCrossed size={20} /> Texture Matching
            </div>
            <div className="flex items-center gap-2 font-display font-bold text-stone-400">
              <CheckCircle2 size={20} /> 100% Vegan
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video md:aspect-square rounded-3xl overflow-hidden bg-stone-200 shadow-2xl shadow-stone-200">
              <img 
                src={image} 
                alt="Uploaded food" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 className="animate-spin" size={48} />
                  <div className="text-center">
                    <p className="font-display font-bold text-xl">Analyzing Flavors...</p>
                    <p className="text-sm opacity-80">Finding the perfect plant-based substitutes</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-stone-900">Ready to Veganify?</h2>
                <p className="text-stone-500">Our AI is ready to break down this dish and rebuild it with plants.</p>
              </div>
              
              {!recipe && !isProcessing && (
                <button 
                  onClick={processImage}
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-all active:scale-[0.98] shadow-lg shadow-brand-200"
                >
                  Veganify This! <ArrowRight size={20} />
                </button>
              )}

              <button 
                onClick={reset}
                className="w-full py-4 bg-white text-stone-600 border border-stone-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-all"
              >
                <RefreshCw size={18} /> Choose Different Image
              </button>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <RefreshCw size={14} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {recipe && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-stone-200 border border-stone-100"
              >
                <div className="markdown-body prose prose-stone max-w-none">
                  <Markdown>{recipe}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderHistory = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display font-bold text-stone-900">Your History</h2>
        <p className="text-stone-500 text-sm">{history.length} items saved locally</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <HistoryIcon size={32} />
          </div>
          <p className="text-stone-500 font-medium">No history yet. Start veganfying some food!</p>
          <button 
            onClick={() => setView('home')}
            className="mt-4 text-brand-600 font-bold hover:underline"
          >
            Go to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6 group"
            >
              <div className="w-full md:w-48 aspect-square rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                <img src={item.image} alt="History item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider">
                    <Clock size={14} />
                    {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <button 
                    onClick={() => deleteFromHistory(item.id)}
                    className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="markdown-body prose prose-stone prose-sm max-w-none line-clamp-6 overflow-hidden relative">
                  <Markdown>{item.recipe}</Markdown>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                </div>
                <button 
                  onClick={() => {
                    setImage(item.image);
                    setRecipe(item.recipe);
                    setView('home');
                  }}
                  className="text-brand-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View Full Recipe <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderResources = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-stone-900">Vegan Resource Hub</h2>
          <p className="text-stone-600 max-w-2xl">
            Free vegan-friendly APIs, live food and recipe samples, and nutrition references you can use today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadResourceFeeds()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-colors"
        >
          <RefreshCw size={16} className={resourcesLoading ? 'animate-spin' : ''} />
          Refresh Feeds
        </button>
      </div>

      {resourcesError && (
        <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-sm font-medium">
          {resourcesError}
        </div>
      )}

      <section className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Free Vegan API Directory</h3>
            <p className="text-sm text-stone-500">Quick-start endpoints and docs links.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VEGAN_API_RESOURCES.map((resource) => (
            <article key={resource.name} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
              <h4 className="font-bold text-stone-900">{resource.name}</h4>
              <p className="text-sm text-stone-600">{resource.summary}</p>
              <p className="text-xs text-stone-500"><span className="font-semibold text-stone-700">Auth:</span> {resource.auth}</p>
              <a href={resource.endpoint} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-700 font-semibold break-all hover:underline">
                {resource.endpoint}
              </a>
              <a href={resource.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-700 font-semibold hover:underline">
                API Docs <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Salad size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Live Vegan Product Feed</h3>
              <p className="text-sm text-stone-500">Sampled from Open Food Facts.</p>
            </div>
          </div>
          {resourcesLoading && veganProducts.length === 0 ? (
            <div className="py-8 text-sm text-stone-500">Loading product data...</div>
          ) : (
            <div className="space-y-3">
              {veganProducts.map((product) => (
                <article key={product.code} className="rounded-2xl border border-stone-200 p-3 bg-stone-50 flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0">
                    {product.image_front_small_url ? (
                      <img src={product.image_front_small_url} alt={product.product_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-stone-900 line-clamp-2">{product.product_name}</h4>
                    <p className="text-xs text-stone-500 mt-1">{product.brands || 'Brand unavailable'}</p>
                    <p className="text-xs text-stone-600 mt-1">Nutri-Score: {product.nutriscore_grade?.toUpperCase() || 'N/A'}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <ChefHat size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Live Vegan Recipe Feed</h3>
              <p className="text-sm text-stone-500">Sampled from TheMealDB.</p>
            </div>
          </div>
          {resourcesLoading && veganMeals.length === 0 ? (
            <div className="py-8 text-sm text-stone-500">Loading vegan recipe ideas...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {veganMeals.map((meal) => (
                <article key={meal.idMeal} className="rounded-2xl border border-stone-200 p-3 bg-stone-50 space-y-2">
                  <div className="aspect-video rounded-xl overflow-hidden bg-stone-100">
                    <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 line-clamp-2">{meal.strMeal}</h4>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Nutrition Knowledge Pack</h3>
            <p className="text-sm text-stone-500">Practical vegan nutrition reminders with source links.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VEGAN_KNOWLEDGE_RESOURCES.map((item) => (
            <article key={item.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <h4 className="font-bold text-stone-900">{item.title}</h4>
              <p className="text-sm text-stone-600 mt-1">{item.value}</p>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-700 font-semibold hover:underline">
                {item.sourceLabel} <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <h2 className="text-3xl font-display font-bold text-stone-900">Settings</h2>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-100 text-stone-700 rounded-xl flex items-center justify-center">
            {secureSettingsEnabled ? <ShieldCheck size={24} /> : <Lock size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-lg">Settings Encryption</h3>
            <p className="text-stone-500 text-sm">
              {secureSettingsEnabled
                ? settingsUnlocked
                  ? 'Encrypted settings are unlocked in this session.'
                  : 'Encrypted settings are locked. Unlock to edit or use your API key.'
                : 'Protect saved settings with a local passphrase.'}
            </p>
          </div>
        </div>

        {!secureSettingsEnabled && (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Create passphrase (min 8 chars)"
              value={lockPassphrase}
              onChange={(e) => setLockPassphrase(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
            <input
              type="password"
              placeholder="Confirm passphrase"
              value={lockPassphraseConfirm}
              onChange={(e) => setLockPassphraseConfirm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => void enableSecureSettings()}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
            >
              Enable Encryption
            </button>
          </div>
        )}

        {secureSettingsEnabled && !settingsUnlocked && (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter passphrase to unlock"
              value={unlockPassphrase}
              onChange={(e) => setUnlockPassphrase(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => void unlockSecureSettings()}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
            >
              Unlock Settings
            </button>
          </div>
        )}

        {securityError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {securityError}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
            <Key size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Bring Your Own API Key</h3>
            <p className="text-stone-500 text-sm">This app never provides API access. Save your own key, model, and generation vibe.</p>
          </div>
        </div>

        <div className={`space-y-6 ${settingsLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-3">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">API Key Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => updateSettings({ provider: 'gemini' })}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.provider === 'gemini' ? 'border-brand-500 bg-brand-50/50 text-brand-700' : 'border-stone-100 hover:border-stone-200 text-stone-500'}`}
              >
                <Sparkles size={24} />
                <span className="font-bold">Google Gemini</span>
                <span className="text-[10px] opacity-70">Recommended</span>
              </button>
              <button 
                onClick={() => updateSettings({ provider: 'openai' })}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.provider === 'openai' ? 'border-brand-500 bg-brand-50/50 text-brand-700' : 'border-stone-100 hover:border-stone-200 text-stone-500'}`}
              >
                <UtensilsCrossed size={24} />
                <span className="font-bold">OpenAI</span>
                <span className="text-[10px] opacity-70">Alternative</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">API Key</label>
            
            <div className="space-y-2">
              <p className="text-xs text-stone-500 font-medium">Enter your own key for the selected provider.</p>
              <input 
                type="password"
                placeholder={`Enter your ${settings.provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key`}
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Model</label>
            <input
              type="text"
              value={settings.models[settings.provider]}
              onChange={(e) =>
                updateSettings({
                  models: {
                    [settings.provider]: e.target.value
                  } as Record<AIProvider, string>
                })
              }
              placeholder="Enter model name"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {MODEL_PRESETS[settings.provider].map((modelName) => (
                <button
                  key={modelName}
                  type="button"
                  onClick={() =>
                    updateSettings({
                      models: {
                        [settings.provider]: modelName
                      } as Record<AIProvider, string>
                    })
                  }
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${settings.models[settings.provider] === modelName ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}
                >
                  {modelName}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Vibe</label>
            <select
              value={settings.vibe}
              onChange={(e) => updateSettings({ vibe: e.target.value as PromptVibe })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            >
              <option value="balanced">Balanced</option>
              <option value="comfort">Comfort Food</option>
              <option value="high-protein">High Protein</option>
              <option value="quick">Quick Weeknight</option>
              <option value="chef">Chef Mode</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Secret Sauce Prompt</label>
            <textarea
              rows={4}
              value={settings.secretSauce}
              onChange={(e) => updateSettings({ secretSauce: e.target.value })}
              placeholder="Optional custom instructions to add to every generation."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-y"
            />
          </div>
        </div>

        <div className="text-sm text-stone-500 space-y-2 pt-4 border-t border-stone-100">
          <p>Your settings are saved locally in your browser and can be passphrase-encrypted. We do not proxy AI requests or provide API keys.</p>
          <div className="flex gap-4">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-xs">
              Gemini Billing →
            </a>
            <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-xs">
              OpenAI Pricing →
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Clear Local Data</h3>
            <p className="text-stone-500 text-sm">Remove all saved history and keys from this browser.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to clear all data? This includes your history and API keys.")) {
              setHistory([]);
              setSettings(DEFAULT_SETTINGS);
              setSecureSettingsEnabled(false);
              setSettingsUnlocked(false);
              setSettingsPassphrase('');
              setLockPassphrase('');
              setLockPassphraseConfirm('');
              setUnlockPassphrase('');
              setSecurityError(null);
              localStorage.removeItem(HISTORY_STORAGE_KEY);
              localStorage.removeItem(SETTINGS_STORAGE_KEY);
              localStorage.removeItem(SETTINGS_SECURE_STORAGE_KEY);
            }
          }}
          className="w-full py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
        >
          Clear All Data
        </button>
      </div>
    </motion.div>
  );

  const renderPrivacy = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-100 space-y-8"
    >
      <h2 className="text-3xl font-display font-bold text-stone-900">Privacy Policy</h2>
      <div className="prose prose-stone max-w-none text-stone-600">
        <p>Last updated: April 11, 2026</p>
        <p>At Veganify AI, we take your privacy seriously. This policy explains how we handle your data.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">1. Data Collection</h3>
        <p>We do not store your images or generated recipes on our servers. All processing is done via your selected BYOK provider, and your history is stored locally in your browser's <code>localStorage</code>.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">2. API Usage</h3>
        <p>When you use the "Veganify" tool, your image and text prompt are sent directly from your browser to your selected provider (for example, Gemini or OpenAI) using your own API key.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">3. Waitlist</h3>
        <p>If you choose to join our waitlist, we collect your email address solely for the purpose of notifying you about product updates. We will never sell your email to third parties.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">4. Local Storage</h3>
        <p>Your recipe history is stored only on your device. BYOK settings are local and can be passphrase-encrypted. You can clear this data at any time through the Settings menu.</p>
      </div>
      <button 
        onClick={() => setView('home')}
        className="text-brand-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
      >
        <ArrowRight className="rotate-180" size={20} /> Back to Home
      </button>
    </motion.div>
  );

  const renderTerms = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-100 space-y-8"
    >
      <h2 className="text-3xl font-display font-bold text-stone-900">Terms of Service</h2>
      <div className="prose prose-stone max-w-none text-stone-600">
        <p>Last updated: April 11, 2026</p>
        <p>By using Veganify AI, you agree to the following terms:</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">1. Use of Service</h3>
        <p>Veganify AI is an AI-powered tool for generating plant-based recipe alternatives. The recipes provided are for informational purposes only.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">2. Accuracy of Content</h3>
        <p>While we strive for high-quality results, AI-generated content may occasionally be inaccurate or include ingredients that do not suit your specific dietary needs or allergies. Always review recipes carefully before cooking.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">3. API Keys</h3>
        <p>Users are responsible for the security and usage of their own API keys. Any costs incurred through the use of your API key are your responsibility.</p>
        
        <h3 className="text-xl font-bold text-stone-900 mt-6">4. Limitation of Liability</h3>
        <p>Veganify AI is not responsible for any culinary mishaps, allergic reactions, or other issues arising from the use of the recipes generated by the service.</p>
      </div>
      <button 
        onClick={() => setView('home')}
        className="text-brand-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
      >
        <ArrowRight className="rotate-180" size={20} /> Back to Home
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-brand-200 pb-24 sm:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Leaf size={20} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Veganify<span className="text-brand-600">AI</span></span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button 
              onClick={() => setView('home')}
              className={`flex items-center gap-1.5 transition-colors ${view === 'home' ? 'text-brand-600' : 'hover:text-brand-600'}`}
            >
              <HomeIcon size={18} /> Home
            </button>
            <button
              onClick={() => setView('resources')}
              className={`flex items-center gap-1.5 transition-colors ${view === 'resources' ? 'text-brand-600' : 'hover:text-brand-600'}`}
            >
              <Database size={18} /> Resources
            </button>
            <button 
              onClick={() => setView('history')}
              className={`flex items-center gap-1.5 transition-colors ${view === 'history' ? 'text-brand-600' : 'hover:text-brand-600'}`}
            >
              <HistoryIcon size={18} /> History
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`flex items-center gap-1.5 transition-colors ${view === 'settings' ? 'text-brand-600' : 'hover:text-brand-600'}`}
            >
              <SettingsIcon size={18} /> Settings
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && renderHome()}
          {view === 'resources' && renderResources()}
          {view === 'history' && renderHistory()}
          {view === 'settings' && renderSettings()}
          {view === 'privacy' && renderPrivacy()}
          {view === 'terms' && renderTerms()}
        </AnimatePresence>

        {/* Waitlist Section - Only on Home */}
        {view === 'home' && !image && (
          <section id="waitlist" className="mt-24 py-16 px-8 bg-stone-900 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/10 blur-[100px] rounded-full" />
            
            <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
              <div className="space-y-4">
                <h2 className="text-4xl font-display font-bold tracking-tight">Join the Culinary Revolution</h2>
                <p className="text-stone-400 text-lg">
                  We're building the future of plant-based cooking. Get early access to our mobile app, personalized meal plans, and exclusive chef-curated recipes.
                </p>
              </div>

              {waitlistStatus === 'success' ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-brand-600/20 border border-brand-600/30 p-6 rounded-2xl flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="font-bold text-xl">You're on the list!</p>
                  <p className="text-stone-300">We'll notify you as soon as we launch.</p>
                </motion.div>
              ) : (
                <form 
                  onSubmit={handleWaitlistSubmit}
                  className="flex flex-col sm:flex-row gap-4"
                  data-netlify="true"
                  name="waitlist"
                >
                  <input type="hidden" name="form-name" value="waitlist" />
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="Enter your email address"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={waitlistStatus === 'loading'}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {waitlistStatus === 'loading' ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>Join Waitlist <Send size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setView('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' ? 'text-brand-600' : 'text-stone-400'}`}
        >
          <HomeIcon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => setView('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'history' ? 'text-brand-600' : 'text-stone-400'}`}
        >
          <HistoryIcon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
        </button>
        <button
          onClick={() => setView('resources')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'resources' ? 'text-brand-600' : 'text-stone-400'}`}
        >
          <Database size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Resources</span>
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'settings' ? 'text-brand-600' : 'text-stone-400'}`}
        >
          <SettingsIcon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block border-t border-stone-200 py-12 mt-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 cursor-pointer" onClick={() => setView('home')}>
            <Leaf size={20} />
            <span className="font-display font-bold text-lg">VeganifyAI</span>
          </div>
          <p className="text-stone-400 text-sm">
            © 2026 Veganify AI. Bring your own API key. No animals were harmed in the making of this app.
          </p>
          <div className="flex gap-6 text-stone-400">
            <button onClick={() => setView('privacy')} className="hover:text-brand-600 transition-colors">Privacy</button>
            <button onClick={() => setView('terms')} className="hover:text-brand-600 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
