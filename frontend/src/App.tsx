import { lazy, Suspense, useState } from 'react';
import { HomePage } from './components/HomePage';
import { IntimacyPage } from './components/IntimacyPage';
import { MemoriesPage } from './components/MemoriesPage';
import { ProfilePage } from './components/ProfilePage';
import { I18nProvider } from './i18n/I18nProvider';
import type { AppView } from './data/homeContent';

const PlacesPage = lazy(() =>
  import('./components/PlacesPage').then((module) => ({
    default: module.PlacesPage,
  })),
);

export function App() {
  const [activeView, setActiveView] = useState<AppView>('home');

  return (
    <I18nProvider>
      {activeView === 'memories' ? (
        <MemoriesPage activeView={activeView} onNavigate={setActiveView} />
      ) : activeView === 'intimacy' ? (
        <IntimacyPage activeView={activeView} onNavigate={setActiveView} />
      ) : activeView === 'places' ? (
        <Suspense fallback={<HomePage activeView={activeView} onNavigate={setActiveView} />}>
          <PlacesPage activeView={activeView} onNavigate={setActiveView} />
        </Suspense>
      ) : activeView === 'profile' ? (
        <ProfilePage activeView={activeView} onNavigate={setActiveView} />
      ) : (
        <HomePage activeView={activeView} onNavigate={setActiveView} />
      )}
    </I18nProvider>
  );
}
