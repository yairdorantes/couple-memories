import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { MemoriesPage } from './components/MemoriesPage';
import { I18nProvider } from './i18n/I18nProvider';
import type { AppView } from './data/homeContent';

export function App() {
  const [activeView, setActiveView] = useState<AppView>('home');

  return (
    <I18nProvider>
      {activeView === 'memories' ? (
        <MemoriesPage activeView={activeView} onNavigate={setActiveView} />
      ) : (
        <HomePage activeView={activeView} onNavigate={setActiveView} />
      )}
    </I18nProvider>
  );
}
