import type { TranslationKey } from "../i18n/translations";

export type PlaceCategory = "trip" | "coffee" | "home" | "date";

export type PlaceMemory = {
  id: string;
  titleKey: TranslationKey;
  date: string;
  image: {
    src: string;
    altKey: TranslationKey;
  };
};

export type CouplePlace = {
  id: string;
  nameKey: TranslationKey;
  latitude: number;
  longitude: number;
  visitedDates: string[];
  coverImage: {
    src: string;
    altKey: TranslationKey;
  };
  descriptionKey: TranslationKey;
  category: PlaceCategory;
  categoryKey: TranslationKey;
  memories: PlaceMemory[];
};

export const couplePlaces: CouplePlace[] = [
  {
    id: "cholula",
    nameKey: "places.place.cholula.name",
    latitude: 19.303649,
    longitude: -99.695403,

    visitedDates: ["2026-03-22", "2026-08-20"],
    coverImage: {
      src: "/images/featured-memory-placeholder.svg",
      altKey: "places.place.cholula.name",
    },
    descriptionKey: "places.place.cholula.description",
    category: "trip",
    categoryKey: "places.category.trip",
    memories: [
      {
        id: "cholula-first-trip",
        titleKey: "featured.title.cholula",
        date: "2026-03-22",
        image: {
          src: "/images/featured-memory-placeholder.svg",
          altKey: "featured.title.cholula",
        },
      },
    ],
  },
  {
    id: "puebla-cafe",
    nameKey: "places.place.pueblaCafe.name",
    latitude: 19.309307,
    longitude: -99.688025,
    visitedDates: ["2026-08-20"],
    coverImage: {
      src: "/images/beach-memory.svg",
      altKey: "places.place.pueblaCafe.name",
    },
    descriptionKey: "places.place.pueblaCafe.description",
    category: "coffee",
    categoryKey: "places.category.coffee",
    memories: [
      {
        id: "coffee-after-rain",
        titleKey: "places.memory.coffeeAfterRain",
        date: "2026-08-20",
        image: {
          src: "/images/beach-memory.svg",
          altKey: "places.memory.coffeeAfterRain",
        },
      },
    ],
  },
  {
    id: "home-sweet-home",
    nameKey: "places.place.home.name",
    latitude: 19.0414,
    longitude: -98.2063,
    visitedDates: ["2026-08-18"],
    coverImage: {
      src: "/images/us.jpg",
      altKey: "places.place.home.name",
    },
    descriptionKey: "places.place.home.description",
    category: "home",
    categoryKey: "places.category.home",
    memories: [
      {
        id: "movie-night",
        titleKey: "places.memory.movieNight",
        date: "2026-08-18",
        image: {
          src: "/images/us.jpg",
          altKey: "places.memory.movieNight",
        },
      },
    ],
  },
];
