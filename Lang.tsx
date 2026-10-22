import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LangId = 'hi' | 'en';

export const LANGUAGES: { id: LangId; label: string; native: string }[] = [
  { id: 'hi', label: 'Hindi', native: 'हिंदी' },
  { id: 'en', label: 'English', native: 'English' },
];

const LS_LANG = 'workflow-lang';

interface LangValue {
  lang: LangId;
  setLang: (l: LangId) => void;
  /** tr(hindi, english) — returns the string for the selected language */
  tr: (hi: string, en: string) => string;
}

const LangContext = createContext<LangValue | null>(null);

function initialLang(): LangId {
  try {
    const saved = localStorage.getItem(LS_LANG);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return 'hi';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangId>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LS_LANG, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((l: LangId) => setLangState(l), []);
  const tr = useCallback((hi: string, en: string) => (lang === 'hi' ? hi : en), [lang]);
  const value = useMemo(() => ({ lang, setLang, tr }), [lang, setLang, tr]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
