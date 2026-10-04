import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import translationsData from '../locales/translations.json';
import { Language } from '../types';

export type TranslationKey = keyof typeof translationsData['da'];

export interface LanguageContextType {
  lang: Language;
  setLang: (newLang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
  strings: typeof translationsData['da'];
}

const STORAGE_KEY = 'local_ai_blog_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'da') {
          return stored;
        }
      }
    } catch {
      // Ignore localStorage access failures
    }
    return 'da'; // Danish as primary default
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev: Language) => {
      const next: Language = prev === 'da' ? 'en' : 'da';
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, next);
          document.documentElement.lang = next;
        }
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const strings = useMemo(() => {
    return translationsData[lang] || translationsData.da;
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const activeDict = translationsData[lang] as Record<string, string>;
      if (activeDict && activeDict[key]) {
        return activeDict[key];
      }
      const defaultDict = translationsData.da as Record<string, string>;
      if (defaultDict && defaultDict[key]) {
        return defaultDict[key];
      }
      return fallback || String(key);
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      strings,
    }),
    [lang, setLang, toggleLang, t, strings]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation(): LanguageContextType {
  return useLanguage();
}
