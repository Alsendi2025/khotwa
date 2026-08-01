import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Lang = 'ar' | 'en';
export type TrObj = { ar: string; en: string };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tr: (o: TrObj) => string };

const LangContext = createContext<Ctx>({ lang: 'ar', setLang: () => {}, tr: (o) => o.ar });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('khotwa-lang') as Lang) || 'ar');
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('khotwa-lang', lang);
  }, [lang]);
  const tr = (o: TrObj) => o[lang];
  return <LangContext.Provider value={{ lang, setLang, tr }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
