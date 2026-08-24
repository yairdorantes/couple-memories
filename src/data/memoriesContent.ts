import type { TranslationKey } from "../i18n/translations";
import type { ImageCrop } from "../utils/imageCrop";

export type MemoryCategoryId = "all" | "travel" | "food" | "movie" | "coffee";
export type MemoryViewMode = "timeline" | "grid" | "calendar";

export type MemoryCategory = {
  id: MemoryCategoryId;
  labelKey: TranslationKey;
};

export type MemoryEntry = {
  id: string;
  title: string;
  caption: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  moodEmoji: string;
  categoryId: Exclude<MemoryCategoryId, "all">;
  categoryLabelKey: TranslationKey;
  dateTime: string;
  image: {
    src: string;
    alt: string;
    crop?: ImageCrop;
  };
  isFavorite: boolean;
};

export const memoryViewModes: Array<{
  id: MemoryViewMode;
  labelKey: TranslationKey;
}> = [
  { id: "timeline", labelKey: "memories.tabs.timeline" },
  { id: "grid", labelKey: "memories.tabs.grid" },
  { id: "calendar", labelKey: "memories.tabs.calendar" },
];

export const memoryCategories: MemoryCategory[] = [
  { id: "all", labelKey: "memories.categories.all" },
  { id: "travel", labelKey: "memories.categories.travel" },
  { id: "food", labelKey: "memories.categories.food" },
  { id: "movie", labelKey: "memories.categories.movie" },
  { id: "coffee", labelKey: "memories.categories.coffee" },
];

export const memoryEntries: MemoryEntry[] = [
  {
    id: "cholula",
    title: "Cholula",
    caption: "Un dia perfecto explorando juntos",
    location: "Cholula",
    moodEmoji: "❤️",
    categoryId: "travel",
    categoryLabelKey: "memories.categories.travel",
    dateTime: "2026-08-20T15:36:00",
    image: {
      src: "/images/featured-memory-placeholder.svg",
      alt: "Cholula memory placeholder",
    },
    isFavorite: true,
  },
  {
    id: "coffee-after-rain",
    title: "Cafe despues de la lluvia",
    caption: "Nos quedamos hablando hasta que cerraron.",
    location: "Puebla",
    moodEmoji: "☕",
    categoryId: "coffee",
    categoryLabelKey: "memories.categories.coffee",
    dateTime: "2026-08-20T15:35:00",
    image: {
      src: "/images/beach-memory.svg",
      alt: "Coffee date placeholder",
    },
    isFavorite: false,
  },
  {
    id: "movie-night",
    title: "Noche de pelicula",
    caption: "La pelicula fue buena, pero el abrazo fue mejor.",
    location: "Casa",
    moodEmoji: "🍿",
    categoryId: "movie",
    categoryLabelKey: "memories.categories.movie",
    dateTime: "2026-08-18T21:10:00",
    image: {
      src: "/images/us.jpg",
      alt: "Movie night placeholder",
    },
    isFavorite: true,
  },
];
