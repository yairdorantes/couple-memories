import { Languages } from 'lucide-react';
import { supportedLanguages, type Language } from '../i18n/translations';
import { useI18n } from '../i18n/I18nContext';

export function LanguageSwitcher() {
  const { language, languageNames, setLanguage, t } = useI18n();

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      <Languages className="h-4 w-4 text-cream-muted" aria-hidden="true" />
      {supportedLanguages.map((option) => (
        <button
          key={option}
          className={option === language ? 'language-option is-active' : 'language-option'}
          type="button"
          aria-pressed={option === language}
          aria-label={languageNames[option]}
          onClick={() => setLanguage(option)}
        >
          {getLanguageLabel(option, t)}
        </button>
      ))}
    </div>
  );
}

function getLanguageLabel(language: Language, t: ReturnType<typeof useI18n>['t']): string {
  return language === 'en' ? t('language.english') : t('language.spanish');
}
