import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import defaultSettingsData from '../data/settings.json';

export interface SiteSettings {
  blogName: string;
  heroTitle: string;
  heroSubtitle: string;
  disclaimerText: string;
  authorName?: string;
  authorRole?: string;
  eyebrowText?: string;
  tags?: string[];
  translations?: {
    en?: {
      blogName?: string;
      heroTitle?: string;
      heroSubtitle?: string;
      disclaimerText?: string;
      authorName?: string;
      authorRole?: string;
      eyebrowText?: string;
    };
    [key: string]: any;
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  blogName: defaultSettingsData.blogName || 'local-ai.blog',
  heroTitle: defaultSettingsData.heroTitle || 'Mine Erfaringer med Lokal AI på Apple Silicon',
  heroSubtitle:
    defaultSettingsData.heroSubtitle ||
    'Personlige eksperimenter, prompts og ufiltrerede tests af åbne modeller direkte på hverdagens hardware.',
  disclaimerText:
    defaultSettingsData.disclaimerText ||
    'Entusiast-deklaration: Jeg er ikke certificeret it-ekspert, men en nysgerrig AI-entusiast. Her deler jeg personlige observationer, brugbare prompts og rå tests af modeller som Gemma 2-9B på Macs med M4-chips.',
  authorName: defaultSettingsData.authorName || 'Jesper',
  authorRole: defaultSettingsData.authorRole || 'Selvlært AI Entusiast',
  eyebrowText: defaultSettingsData.eyebrowText || 'UDVALGT ARTIKEL • 6 MIN LÆSETID',
  tags: defaultSettingsData.tags || [
    'Apple Silicon',
    'CoreML',
    'Gemma 2-9B',
    'Privatliv',
    'Ollama',
  ],
  translations: defaultSettingsData.translations || {
    en: {
      blogName: 'local-ai.blog',
      heroTitle: 'My Experiences with Local AI on Apple Silicon',
      heroSubtitle:
        'Personal experiments, prompts, and unvarnished tests of open models directly on everyday hardware.',
      disclaimerText:
        'Enthusiast declaration: I am not a certified IT specialist, but an avid AI enthusiast. Here I share personal observations, practical prompts, and raw tests of models like Gemma 2-9B on Macs with M4 silicon.',
      authorName: 'Jesper',
      authorRole: 'Self-taught AI Enthusiast',
      eyebrowText: 'FEATURED EDITORIAL • 6 MIN READ',
    },
  },
};

const STORAGE_KEY = 'localai_blog_site_settings';
const LEGACY_STORAGE_KEY = 'localai_blog_hero_settings';
const CUSTOM_EVENT_KEY = 'localai_settings_sync';

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (partial: Partial<SiteSettings>) => void;
  saveSettings: (customSettings?: SiteSettings) => Promise<{ success: boolean; message: string }>;
  resetToDefaults: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
  lastSavedFormatted: string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...DEFAULT_SITE_SETTINGS,
            ...parsed,
            blogName: parsed.blogName || DEFAULT_SITE_SETTINGS.blogName,
          };
        }
      } catch (e) {
        console.warn('Failed to parse local site settings', e);
      }
    }
    return DEFAULT_SITE_SETTINGS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync settings with /api/settings from physical disk on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/settings')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((diskSettings) => {
        if (isMounted && diskSettings && typeof diskSettings === 'object' && Object.keys(diskSettings).length > 0) {
          setSettings((prev) => ({
            ...prev,
            ...diskSettings,
            blogName: diskSettings.blogName || prev.blogName || 'local-ai.blog',
          }));
        }
      })
      .catch((err) => {
        console.warn('Failed to read /api/settings from disk, using local state', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync tab events & cross-window updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if ((e.key === STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore error
        }
      }
    };

    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings((prev) => ({ ...prev, ...customEvent.detail }));
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CUSTOM_EVENT_KEY, handleCustomSync as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CUSTOM_EVENT_KEY, handleCustomSync as EventListener);
    };
  }, []);

  // Keep document title and meta tag synchronized
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const titleName = settings.blogName || 'local-ai.blog';
      const mainTitle = settings.heroTitle || 'On-Device AI';
      document.title = `${titleName} — ${mainTitle}`;
    }
  }, [settings.blogName, settings.heroTitle]);

  // Reactive instant local updates (for live typing feedback)
  const updateSettings = useCallback((partial: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...partial };
      // Also cache temporarily in localStorage for instant reload safety
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  }, []);

  // Save & Sync action: Overwrites local settings.json on disk (via server) and localStorage
  const saveSettings = useCallback(
    async (customSettings?: SiteSettings): Promise<{ success: boolean; message: string }> => {
      const toSave = customSettings || settings;
      setIsSaving(true);

      try {
        // 1. Update localStorage immediately (local-first/offline)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(toSave));

        // Dispatch custom event to notify all components immediately
        window.dispatchEvent(
          new CustomEvent<SiteSettings>(CUSTOM_EVENT_KEY, { detail: toSave })
        );

        // 2. Overwrite physical settings.json and src/data/settings.json via Express API
        let diskSuccess = false;
        try {
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(toSave, null, 2),
          });
          if (res.ok) {
            diskSuccess = true;
          }
        } catch (apiErr) {
          console.warn('Network error writing to /api/settings; cached locally in localStorage', apiErr);
        }

        const now = new Date();
        setLastSaved(now);
        setSettings(toSave);

        return {
          success: true,
          message: diskSuccess
            ? 'Indstillinger gemt i settings.json på disken & opdateret'
            : 'Gemt lokalt i browser-storage & live opdateret',
        };
      } catch (err: any) {
        console.error('Failed to save settings', err);
        return {
          success: false,
          message: err?.message || 'Kunne ikke gemme indstillinger',
        };
      } finally {
        setIsSaving(false);
      }
    },
    [settings]
  );

  const resetToDefaults = useCallback(async () => {
    await saveSettings(DEFAULT_SITE_SETTINGS);
  }, [saveSettings]);

  const lastSavedFormatted = lastSaved
    ? `Gemt: ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : 'Ikke gemt i denne session';

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSettings,
        resetToDefaults,
        isSaving,
        lastSaved,
        lastSavedFormatted,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
