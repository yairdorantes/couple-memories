import { useEffect, useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { FeaturedMemoryCard } from "./FeaturedMemoryCard";
import { FloatingActionButton } from "./FloatingActionButton";
import { FloatingHearts } from "./FloatingHearts";
import { HeroCard } from "./HeroCard";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MemoryHighlights } from "./MemoryHighlights";
import { TogetherCounter } from "./TogetherCounter";
import {
  highlightCards,
  navItems,
  relationshipConfig,
} from "../data/homeContent";
import { getRelationshipDuration } from "../utils/dateDuration";
import { useI18n } from "../i18n/I18nContext";
import type { AppView } from "../data/homeContent";

type HomePageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
};

function useRelationshipDuration(startDate: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return getRelationshipDuration(startDate, now);
}

export function HomePage({ activeView, onNavigate }: HomePageProps) {
  const duration = useRelationshipDuration(relationshipConfig.startDate);
  const { language } = useI18n();

  return (
    <main className='min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <FloatingHearts />
      <div className='screen-glow' aria-hidden='true' />
      <div className='relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-32 pt-6 sm:px-6 lg:px-8'>
        <div className='mx-auto w-full max-w-[31rem] space-y-5 sm:max-w-[39rem] md:max-w-[46rem] lg:max-w-[54rem]'>
          {/* <div className="flex justify-end">
            <LanguageSwitcher />
          </div> */}
          <HeroCard
            config={relationshipConfig}
            totalDays={duration.totalDays}
            language={language}
          />
          <TogetherCounter duration={duration} />
          <FeaturedMemoryCard />
          <MemoryHighlights highlights={highlightCards} />
        </div>
      </div>
      <FloatingActionButton />
      <BottomNavigation
        activeView={activeView}
        items={navItems}
        onNavigate={onNavigate}
      />
    </main>
  );
}
