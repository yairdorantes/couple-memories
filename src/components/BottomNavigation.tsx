import type { NavItem } from '../data/homeContent';
import { useI18n } from '../i18n/I18nContext';
import type { AppView } from '../data/homeContent';

type BottomNavigationProps = {
  activeView: AppView;
  items: NavItem[];
  onNavigate: (view: AppView) => void;
};

export function BottomNavigation({ activeView, items, onNavigate }: BottomNavigationProps) {
  const { t } = useI18n();

  return (
    <nav className="bottom-nav" aria-label={t('nav.ariaLabel')}>
      {items.map((item) => {
        const Icon = item.icon;
        const label = t(item.labelKey);
        const isActive = item.view === activeView;

        return (
          <button
            key={item.labelKey}
            className={isActive ? 'bottom-nav-item is-active' : 'bottom-nav-item'}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
            onClick={() => onNavigate(item.view)}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
