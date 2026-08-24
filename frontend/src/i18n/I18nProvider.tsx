import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nContext, type I18nContextValue, type Translate } from './I18nContext';
import { getDefaultLanguage, languageNames, translations, type Language, type TranslationKey } from './translations';

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(() => getDefaultLanguage());

  useEffect(() => {
    try {
      window.localStorage.setItem('couple-memories-language', language);
    } catch {
      // Storage can be unavailable in some private browsing contexts.
    }

    document.documentElement.lang = language;
    document.title = readTranslation(language, 'app.title');
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const t: Translate = (key, ...args) => readTranslation(language, key, ...args);

    return {
      language,
      languageNames,
      setLanguage,
      t,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function readTranslation(
  language: Language,
  key: TranslationKey,
  ...args: Array<number | string>
): string {
  const value = translations[language][key];
  return typeof value === 'function' ? value(...args) : value;
}
