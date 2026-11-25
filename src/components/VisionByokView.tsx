import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Key,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { AIProvider, PromptVibe, veganifyFood } from '../lib/ai';
import { decryptSettings, EncryptedPayloadV1, encryptSettings } from '../lib/secureSettings';

interface UserSettings {
  provider: AIProvider;
  apiKey: string;
  models: Record<AIProvider, string>;
  vibe: PromptVibe;
  secretSauce: string;
}

const SETTINGS_STORAGE_KEY = 'veganify_settings_v1';
const SETTINGS_SECURE_STORAGE_KEY = 'veganify_settings_secure_v1';

const DEFAULT_SETTINGS: UserSettings = {
  provider: 'gemini',
  apiKey: '',
  models: {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini',
  },
  vibe: 'balanced',
  secretSauce: '',
};

const MODEL_PRESETS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
};

interface VisionByokViewProps {
  onSaveVisionRecipe: (markdown: string, imagePreview: string, vibe: PromptVibe) => void;
  onClearAllData: () => void;
}

export const VisionByokView: React.FC<VisionByokViewProps> = ({
  onSaveVisionRecipe,
  onClearAllData,
}) => {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const mergeSettings = (parsed: Partial<UserSettings>): UserSettings => ({
    ...DEFAULT_SETTINGS,
    ...parsed,
    models: {
      ...DEFAULT_SETTINGS.models,
      ...(parsed.models || {}),
    },
  });

  useEffect(() => {
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
    } catch {
      // Ignore malformed stored settings
    }
  }, []);

  const persistSettings = async (next: UserSettings) => {
    if (secureSettingsEnabled) {
      if (!settingsUnlocked || !settingsPassphrase) return;
      const payload = await encryptSettings(JSON.stringify(next), settingsPassphrase);
      localStorage.setItem(SETTINGS_SECURE_STORAGE_KEY, JSON.stringify(payload));
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((current) => {
      const merged: UserSettings = {
        ...current,
        ...partial,
        models: {
          ...current.models,
          ...(partial.models || {}),
        },
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
    } catch {
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
    } catch {
      setSecurityError('Could not unlock settings. Check your passphrase.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setRecipe(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!image) return;
    if (secureSettingsEnabled && !settingsUnlocked) {
      setError('Unlock your encrypted settings below before analyzing a photo.');
      return;
    }
    if (!settings.apiKey.trim()) {
      setError('Add a Gemini or OpenAI API key below to run photo vision, or use the 100% offline Recipe Converter tab with zero API key.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      const result = await veganifyFood(image, mimeType, {
        provider: settings.provider,
        apiKey: settings.apiKey.trim(),
        model: settings.models[settings.provider],
        vibe: settings.vibe,
        secretSauce: settings.secretSauce,
      });

      if (result) {
        setRecipe(result);
        onSaveVisionRecipe(result, image, settings.vibe);
      } else {
        throw new Error('Empty response from provider.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'API_KEY_INVALID') {
        setError('Your BYOK API key was rejected by the provider. Verify the key and try again.');
      } else {
        setError('Could not analyze the uploaded image. Check your provider quota or network connection.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const settingsLocked = secureSettingsEnabled && !settingsUnlocked;

  return (
    <div className="space-y-8">
      <section className="space-y-2 pb-5 border-b border-paper-200">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-botanical-700">
          Optional Add-On · Direct Browser-to-Provider BYOK
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink-950">
          Photo-to-Recipe Vision (Optional BYOK)
        </h1>
        <p className="text-sm sm:text-base text-ink-600 max-w-[66ch]">
          Upload a dish photo and analyze it directly from your browser using your own Gemini or OpenAI key. Keys stay in local storage with optional AES-256-GCM passphrase encryption and never touch our servers.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Photo Upload & Result */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-paper-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-botanical-600" />
            <h2 className="text-lg font-display font-semibold text-ink-950">Dish Photo Analyzer</h2>
          </div>

          {!image ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-paper-300 bg-paper-50 hover:border-botanical-600 hover:bg-botanical-50/40 flex flex-col items-center justify-center gap-3 p-6 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-paper-200 flex items-center justify-center text-botanical-600">
                <Camera size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-ink-950">Upload a photo of any non-vegan meal</p>
                <p className="text-xs text-ink-500 mt-0.5">PNG, JPG, or WEBP · Processed directly via your BYOK key</p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-paper-100 border border-paper-200">
                <img
                  src={image}
                  alt="Uploaded dish preview for plant-based conversion"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-semibold">Analyzing dish flavors & textures...</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => void processImage()}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-botanical-600 hover:bg-botanical-700 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Analyze Photo <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setRecipe(null);
                    setError(null);
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-paper-50 border border-paper-200 hover:bg-paper-100 text-ink-800 text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw size={15} />
                  Clear
                </button>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {error && (
            <div className="p-3.5 rounded-xl bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {recipe && (
            <div className="pt-4 border-t border-paper-200 markdown-body text-sm">
              <Markdown>{recipe}</Markdown>
            </div>
          )}
        </section>

        {/* BYOK Settings & Local Encryption */}
        <section className="lg:col-span-6 space-y-5">
          <div className="bg-white rounded-2xl border border-paper-200 p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botanical-50 text-botanical-700 flex items-center justify-center">
                <Key size={19} />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-ink-950">BYOK Provider Configuration</h2>
                <p className="text-xs text-ink-500">Only needed for photo vision. Offline Recipe Converter needs no key.</p>
              </div>
            </div>

            <div className={`space-y-4 ${settingsLocked ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => updateSettings({ provider: 'gemini' })}
                  className={`min-h-[44px] p-3 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    settings.provider === 'gemini'
                      ? 'border-botanical-600 bg-botanical-50 text-botanical-800'
                      : 'border-paper-200 bg-paper-50 text-ink-700 hover:border-botanical-600'
                  }`}
                >
                  <Sparkles size={16} />
                  Google Gemini
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ provider: 'openai' })}
                  className={`min-h-[44px] p-3 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    settings.provider === 'openai'
                      ? 'border-botanical-600 bg-botanical-50 text-botanical-800'
                      : 'border-paper-200 bg-paper-50 text-ink-700 hover:border-botanical-600'
                  }`}
                >
                  <UtensilsCrossed size={16} />
                  OpenAI
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="byok-key" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                  {settings.provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key
                </label>
                <input
                  id="byok-key"
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  placeholder={`Paste your ${settings.provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key`}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm font-mono text-ink-950 focus:outline-none focus:border-botanical-600"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="byok-model" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                  Model
                </label>
                <input
                  id="byok-model"
                  type="text"
                  value={settings.models[settings.provider]}
                  onChange={(e) =>
                    updateSettings({
                      models: {
                        [settings.provider]: e.target.value,
                      } as Record<AIProvider, string>,
                    })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm font-mono text-ink-950 focus:outline-none focus:border-botanical-600"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {MODEL_PRESETS[settings.provider].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        updateSettings({
                          models: { [settings.provider]: m } as Record<AIProvider, string>,
                        })
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-mono border cursor-pointer ${
                        settings.models[settings.provider] === m
                          ? 'bg-botanical-50 border-botanical-600 text-botanical-800'
                          : 'bg-paper-50 border-paper-200 text-ink-600 hover:border-ink-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="byok-secret-sauce" className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
                  Extra Dietary Instructions (Optional)
                </label>
                <textarea
                  id="byok-secret-sauce"
                  rows={2}
                  value={settings.secretSauce}
                  onChange={(e) => updateSettings({ secretSauce: e.target.value })}
                  placeholder="e.g. Keep oil minimal, prioritize soy-free swaps..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Local AES-GCM Passphrase Vault */}
          <div className="bg-white rounded-2xl border border-paper-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-paper-100 text-ink-800 flex items-center justify-center">
                {secureSettingsEnabled ? <ShieldCheck size={19} /> : <Lock size={19} />}
              </div>
              <div>
                <h2 className="text-base font-display font-semibold text-ink-950">
                  AES-256-GCM Local Key Encryption
                </h2>
                <p className="text-xs text-ink-500">
                  {secureSettingsEnabled
                    ? settingsUnlocked
                      ? 'Encrypted settings are unlocked for this session.'
                      : 'Encrypted settings are locked. Enter your passphrase to unlock.'
                    : 'Optionally encrypt saved API keys with a local browser passphrase.'}
                </p>
              </div>
            </div>

            {!secureSettingsEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="password"
                  placeholder="Create passphrase (8+ chars)"
                  value={lockPassphrase}
                  onChange={(e) => setLockPassphrase(e.target.value)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
                />
                <input
                  type="password"
                  placeholder="Confirm passphrase"
                  value={lockPassphraseConfirm}
                  onChange={(e) => setLockPassphraseConfirm(e.target.value)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
                />
                <button
                  type="button"
                  onClick={() => void enableSecureSettings()}
                  className="sm:col-span-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-ink-950 hover:bg-ink-800 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Enable Passphrase Encryption
                </button>
              </div>
            )}

            {secureSettingsEnabled && !settingsUnlocked && (
              <div className="flex gap-2.5">
                <input
                  type="password"
                  placeholder="Enter passphrase to unlock"
                  value={unlockPassphrase}
                  onChange={(e) => setUnlockPassphrase(e.target.value)}
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-paper-50 border border-paper-200 text-sm text-ink-950 focus:outline-none focus:border-botanical-600"
                />
                <button
                  type="button"
                  onClick={() => void unlockSecureSettings()}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            )}

            {securityError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {securityError}
              </p>
            )}

            <div className="pt-2 border-t border-paper-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all locally saved cookbook recipes and BYOK settings from this browser?')) {
                    localStorage.removeItem(SETTINGS_STORAGE_KEY);
                    localStorage.removeItem(SETTINGS_SECURE_STORAGE_KEY);
                    setSettings(DEFAULT_SETTINGS);
                    setSecureSettingsEnabled(false);
                    setSettingsUnlocked(false);
                    setSettingsPassphrase('');
                    onClearAllData();
                  }
                }}
                className="min-h-[44px] w-full px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                Clear All Local Browser Data
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
