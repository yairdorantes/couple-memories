import {
  Heart,
  Home,
  Images,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TranslationKey } from "../i18n/translations";

export type AppView =
  | "home"
  | "love"
  | "memories"
  | "recap"
  | "profile"
  | "places";

export type NavItem = {
  view: AppView;
  labelKey: TranslationKey;
  icon: LucideIcon;
};

export type HighlightCard = {
  id: string;
  titleKey: TranslationKey;
  value: string;
  captionKey: TranslationKey;
  icon: LucideIcon;
};

export type FeaturedMemory = {
  id: string;
  titleKey: TranslationKey;
  captionKey: TranslationKey;
  date: string;
  detailHref: string;
  image: {
    src: string;
    altKey: TranslationKey;
  };
};

export type RelationshipConfig = {
  coupleNames: string;
  partnerName: string;
  startDate: string;
  nextAnniversaryDate: string;
  heroImage: {
    src: string;
    altKey: TranslationKey;
  };
  avatarImages: Array<{
    src: string;
    altKey: TranslationKey;
    ringColor: "blue" | "rose";
  }>;
};

export const relationshipConfig: RelationshipConfig = {
  coupleNames: "Lesli & Yair",
  partnerName: "Ananya",
  startDate: "2026-01-10",
  nextAnniversaryDate: "2027-01-11",
  heroImage: {
    src: "/images/us2.jpg",
    altKey: "hero.imageAlt",
  },
  avatarImages: [
    {
      src: "/images/me.jpg",
      altKey: "hero.avatarOneAlt",
      ringColor: "blue",
    },
    {
      src: "/images/she.jpg",
      altKey: "hero.avatarTwoAlt",
      ringColor: "rose",
    },
  ],
};

export const highlightCards: HighlightCard[] = [
  {
    id: "memories",
    titleKey: "highlights.memories.title",
    value: "128",
    captionKey: "highlights.memories.caption",
    icon: Images,
  },
  {
    id: "places",
    titleKey: "highlights.places.title",
    value: "24",
    captionKey: "highlights.places.caption",
    icon: MapPin,
  },
  {
    id: "letters",
    titleKey: "highlights.letters.title",
    value: "16",
    captionKey: "highlights.letters.caption",
    icon: Heart,
  },
];

export const featuredMemories: FeaturedMemory[] = [
  {
    id: "cholula-first-trip",
    titleKey: "featured.title.cholula",
    captionKey: "featured.caption.cholula",
    date: "2026-03-22",
    detailHref: "/memories/cholula-first-trip",
    image: {
      src: "/images/featured-memory-placeholder.svg",
      altKey: "featured.title.cholula",
    },
  },
];

export const navItems: NavItem[] = [
  { view: "home", labelKey: "nav.home", icon: Home },
  { view: "memories", labelKey: "nav.memories", icon: Images },
  { view: "places", labelKey: "nav.places", icon: MapPin },
  // { view: "love", labelKey: "nav.love", icon: Heart },
  { view: "recap", labelKey: "nav.recap", icon: Sparkles },
  { view: "profile", labelKey: "nav.profile", icon: UserRound },
];
