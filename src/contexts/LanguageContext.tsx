import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, TranslationKey } from "@/lib/i18n";

type Language = "vi" | "en";

interface LanguageContextValue {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-lang");
    if (saved === "vi" || saved === "en") setLanguageState(saved);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dashboard-lang", lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] ?? translations.vi[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, lang: language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}