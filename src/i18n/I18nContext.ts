import { createContext, useContext } from 'react';
import type { Language, TranslationKey } from './translations';

export type Translate = (key: TranslationKey, ...args: Array<number | string>) => string;

export type I18nContextValue = {
  language: Language;
  languageNames: Record<Language, string>;
  setLanguage: (language: Language) => void;
  t: Translate;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
