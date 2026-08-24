import { useEffect, useMemo, useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { FeaturedMemoryCard } from "./FeaturedMemoryCard";
import { FloatingHearts } from "./FloatingHearts";
import { HeroCard } from "./HeroCard";
import { MemoryHighlights } from "./MemoryHighlights";
import { PositionedImage } from "./PositionedImage";
import { TogetherCounter } from "./TogetherCounter";
import {
  getMemoryImageCropKey,
  getProfileMembers,
  toProfilePerson,
} from "../api/adapters";
import {
  useDefaultCouple,
  useCoupleHeroImages,
  useFeaturedMemories,
  useMemories,
  usePlaces,
} from "../api/hooks";
import {
  highlightCards,
  navItems,
  relationshipConfig,
} from "../data/homeContent";
import { getRelationshipDuration } from "../utils/dateDuration";
import { useI18n } from "../i18n/I18nContext";
import type { AppView, RelationshipConfig } from "../data/homeContent";
import { getLocalDateKey } from "../utils/dateTime";
import { getStoredImageCrop } from "../utils/imageCrop";
import type { ApiCoupleHeroImage } from "../api/types";
import type { ProfilePerson, ProfileRole } from "../data/profileContent";
import type { CSSProperties } from "react";

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
  const [randomHeroImage, setRandomHeroImage] =
    useState<ApiCoupleHeroImage | null>(null);
  const todayKey = getLocalDateKey(new Date());
  const timezoneOffset = new Date().getTimezoneOffset();
  const coupleQuery = useDefaultCouple();
  const heroImagesQuery = useCoupleHeroImages(coupleQuery.data?.id);
  const featuredMemoriesQuery = useFeaturedMemories(todayKey, timezoneOffset);
  const memoriesQuery = useMemories({ category: "all", search: "" });
  const placesQuery = usePlaces();
  const profileMembers = getProfileMembers(coupleQuery.data);
  const himProfile = profileMembers
    ? toProfilePerson(profileMembers.him)
    : null;
  const herProfile = profileMembers
    ? toProfilePerson(profileMembers.her)
    : null;
  useEffect(() => {
    if (randomHeroImage || !heroImagesQuery.data?.length) {
      return;
    }

    const heroImages = heroImagesQuery.data;
    setRandomHeroImage(
      heroImages[Math.floor(Math.random() * heroImages.length)] ?? null,
    );
  }, [heroImagesQuery.data, randomHeroImage]);

  const heroConfig: RelationshipConfig = profileMembers
    ? {
        ...relationshipConfig,
        heroImage: randomHeroImage
          ? {
              src:
                randomHeroImage.media_detail?.url ??
                randomHeroImage.media_detail?.optimized_url ??
                relationshipConfig.heroImage.src,
              altKey: "hero.imageAlt",
              crop: randomHeroImage.crop,
            }
          : relationshipConfig.heroImage,
        coupleNames: `${profileMembers.her.name} & ${profileMembers.him.name}`,
        avatarImages: [
          {
            src:
              himProfile?.avatarSrc ?? relationshipConfig.avatarImages[0].src,
            altKey: "profile.him.avatarAlt",
            ringColor: "blue" as const,
            accentColor: himProfile?.accentColor,
            crop: himProfile?.avatarCrop,
          },
          {
            src:
              herProfile?.avatarSrc ?? relationshipConfig.avatarImages[1].src,
            altKey: "profile.her.avatarAlt",
            ringColor: "rose" as const,
            accentColor: herProfile?.accentColor,
            crop: herProfile?.avatarCrop,
          },
        ],
      }
    : {
        ...relationshipConfig,
        heroImage: randomHeroImage
          ? {
              src:
                randomHeroImage.media_detail?.url ??
                randomHeroImage.media_detail?.optimized_url ??
                relationshipConfig.heroImage.src,
              altKey: "hero.imageAlt",
              crop: randomHeroImage.crop,
            }
          : relationshipConfig.heroImage,
      };
  const homeHighlights = highlightCards.map((highlight) => {
    if (highlight.id === "memories") {
      const firstPage = memoriesQuery.data?.pages[0];
      const loadedCount =
        memoriesQuery.data?.pages.reduce(
          (count, page) => count + page.results.length,
          0,
        ) ?? 0;
      return {
        ...highlight,
        value: String(firstPage?.count ?? loadedCount),
      };
    }

    if (highlight.id === "places") {
      return {
        ...highlight,
        value: String(placesQuery.data?.length ?? 0),
      };
    }

    return highlight;
  });
  const featuredMemories = useMemo(
    () =>
      featuredMemoriesQuery.data?.map((memory) => ({
        id: String(memory.id),
        title: memory.title,
        caption: memory.caption,
        date: getLocalDateKey(memory.happened_at),
        image: {
          src:
            memory.primary_media_detail?.url ??
            memory.primary_media_detail?.optimized_url ??
            "",
          alt: memory.title,
          crop: getStoredImageCrop(getMemoryImageCropKey(memory.id)),
        },
      })) ?? [],
    [featuredMemoriesQuery.data],
  );

  return (
    <main className='min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <FloatingHearts />
      <div className='screen-glow' aria-hidden='true' />
      <div className='relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-32 pt-6 sm:px-6 lg:px-8'>
        <div className='mx-auto w-full max-w-[31rem] space-y-5 sm:max-w-[39rem] md:max-w-[46rem] lg:max-w-[54rem]'>
          <HeroCard
            config={heroConfig}
            totalDays={duration.totalDays}
            language={language}
          />
          {herProfile && himProfile ? (
            <CoupleStatusStrip
              people={{ her: herProfile, him: himProfile }}
              onEdit={() => onNavigate("profile")}
            />
          ) : null}
          <FeaturedMemoryCard
            memories={featuredMemories}
            isLoading={featuredMemoriesQuery.isLoading}
            onViewMemory={() => onNavigate("memories")}
          />
          <TogetherCounter duration={duration} />
          <MemoryHighlights highlights={homeHighlights} />
        </div>
      </div>
      {/* <FloatingActionButton /> */}
      <BottomNavigation
        activeView={activeView}
        items={navItems}
        onNavigate={onNavigate}
      />
    </main>
  );
}

type CoupleStatusStripProps = {
  people: Record<ProfileRole, ProfilePerson>;
  onEdit: () => void;
};

function CoupleStatusStrip({ people, onEdit }: CoupleStatusStripProps) {
  const { t } = useI18n();
  const roles = useMemo(() => ["her", "him"] as const, []);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveRoleIndex((currentIndex) => (currentIndex + 1) % roles.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [roles.length]);

  const activeRole = roles[activeRoleIndex] ?? "her";
  const activePerson = people[activeRole];
  const note = activePerson.statusNote.trim();

  return (
    <section className='couple-status-strip' aria-label={t("home.status.ariaLabel")}>
      <button
        key={activeRole}
        className='couple-status-bubble'
        type='button'
        style={{ "--status-accent": activePerson.accentColor } as CSSProperties}
        onClick={onEdit}
      >
        <PositionedImage
          src={activePerson.avatarSrc}
          alt={t(activePerson.avatarAltKey)}
          crop={activePerson.avatarCrop}
        />
        <span>
          <strong>{activePerson.name}</strong>
          <em>{note || t("profile.note.empty")}</em>
        </span>
      </button>
      <div className='couple-status-dots' aria-hidden='true'>
        {roles.map((role, index) => (
          <span
            key={role}
            className={index === activeRoleIndex ? "is-active" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
