import { lazy, Suspense, useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { IntimacyPage } from './components/IntimacyPage';
import { MemoryDetailPage } from './components/MemoryDetailPage';
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
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    function syncRouteFromHash() {
      setRoute(readRoute());
    }

    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, []);

  function navigateToView(view: AppView) {
    const nextRoute: AppRoute = { view };
    setRoute(nextRoute);
    window.location.hash = view === 'home' ? '' : view;
  }

  function navigateToMemory(memoryId: string) {
    const parsedMemoryId = Number(memoryId);
    if (!Number.isInteger(parsedMemoryId) || parsedMemoryId < 1) {
      navigateToView('memories');
      return;
    }
    const nextRoute: AppRoute = { view: 'memories', memoryId: parsedMemoryId };
    setRoute(nextRoute);
    window.location.hash = `memory/${parsedMemoryId}`;
  }

  const activeView = route.view;

  return (
    <I18nProvider>
      {route.memoryId ? (
        <MemoryDetailPage memoryId={route.memoryId} onBack={() => navigateToView('memories')} />
      ) : activeView === 'memories' ? (
        <MemoriesPage activeView={activeView} onNavigate={navigateToView} onOpenMemory={navigateToMemory} />
      ) : activeView === 'intimacy' ? (
        <IntimacyPage activeView={activeView} onNavigate={navigateToView} />
      ) : activeView === 'places' ? (
        <Suspense fallback={<HomePage activeView={activeView} onNavigate={navigateToView} />}>
          <PlacesPage
            activeView={activeView}
            onNavigate={navigateToView}
            onOpenMemory={navigateToMemory}
          />
        </Suspense>
      ) : activeView === 'profile' ? (
        <ProfilePage activeView={activeView} onNavigate={navigateToView} />
      ) : (
        <HomePage activeView={activeView} onNavigate={navigateToView} />
      )}
    </I18nProvider>
  );
}

type AppRoute = {
  view: AppView;
  memoryId?: number;
};

function readRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');
  const memoryMatch = /^memory\/(\d+)$/.exec(hash);
  if (memoryMatch?.[1]) {
    return { view: 'memories', memoryId: Number(memoryMatch[1]) };
  }

  if (isAppView(hash)) {
    return { view: hash };
  }
  return { view: 'home' };
}

function isAppView(value: string): value is AppView {
  return ['home', 'love', 'memories', 'recap', 'profile', 'places', 'intimacy'].includes(value);
}
