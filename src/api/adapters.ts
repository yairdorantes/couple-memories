import type { CouplePlace } from "../data/placesContent";
import type { IntimacyEntry } from "../data/intimacyContent";
import type { ProfilePerson, ProfileRole } from "../data/profileContent";
import type { MemoryEntry } from "../data/memoriesContent";
import type { TranslationKey } from "../i18n/translations";
import type { ApiCouple, ApiCoupleMember, ApiIntimacyRecord, ApiMemory, ApiPlace } from "./types";
import { getStoredImageCrop } from "../utils/imageCrop";
import { getLocalDateKey, toLocalDateTimeInputValue } from "../utils/dateTime";

const categoryLabels: Record<MemoryEntry["categoryId"], TranslationKey> = {
  travel: "memories.categories.travel",
  food: "memories.categories.food",
  movie: "memories.categories.movie",
  coffee: "memories.categories.coffee",
};

export function toMemoryEntry(memory: ApiMemory): MemoryEntry {
  const imageUrl = memory.primary_media_detail?.url ?? memory.primary_media_detail?.optimized_url ?? "";

  return {
    id: String(memory.id),
    title: memory.title,
    caption: memory.caption,
    location: memory.location_name || memory.place_detail?.name || "",
    latitude: memory.latitude === null ? null : Number(memory.latitude),
    longitude: memory.longitude === null ? null : Number(memory.longitude),
    moodEmoji: memory.mood_emoji,
    categoryId: memory.category,
    categoryLabelKey: categoryLabels[memory.category] ?? "memories.categories.travel",
    dateTime: toLocalDateTimeInputValue(memory.happened_at),
    image: {
      src: imageUrl,
      alt: memory.title,
      crop: getStoredImageCrop(getMemoryImageCropKey(memory.id)),
    },
    isFavorite: memory.is_favorite,
  };
}

export function toIntimacyEntry(record: ApiIntimacyRecord): IntimacyEntry {
  return {
    id: String(record.id),
    title: record.title,
    happenedAt: toLocalDateTimeInputValue(record.happened_at),
    place: record.place,
    mood: record.mood,
    note: record.note,
    isFavorite: record.is_favorite,
  };
}

export function toProfilePerson(member: ApiCoupleMember): ProfilePerson {
  return {
    role: member.role,
    name: member.name,
    avatarSrc: member.avatar_detail?.url ?? (member.role === "her" ? "/images/she.jpg" : "/images/me.jpg"),
    avatarAltKey: member.role === "her" ? "profile.her.avatarAlt" : "profile.him.avatarAlt",
    avatarCrop: getStoredImageCrop(getProfileAvatarCropKey(member.role)),
    birthday: member.birthday ?? "",
    accentColor: member.accent_color,
    description: member.description,
    statusNote: member.status_note,
  };
}

export function getProfileMembers(couple: ApiCouple | undefined): Record<ProfileRole, ApiCoupleMember> | undefined {
  const her = couple?.members.find((member) => member.role === "her");
  const him = couple?.members.find((member) => member.role === "him");

  if (!her || !him) {
    return undefined;
  }

  return { her, him };
}

export function toCouplePlace(place: ApiPlace, memories: ApiMemory[]): CouplePlace {
  const relatedMemories = memories.filter((memory) => memory.place === place.id);

  return {
    id: String(place.id),
    nameKey: "places.place.cholula.name",
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    visitedDates: relatedMemories.length > 0
      ? relatedMemories.map((memory) => getLocalDateKey(memory.happened_at))
      : [getLocalDateKey(place.created_at)],
    coverImage: {
      src: place.cover_media_detail?.url ?? "/images/featured-memory-placeholder.svg",
      altKey: "places.place.cholula.name",
      crop: getStoredImageCrop(getPlaceCoverCropKey(place.id)),
    },
    descriptionKey: "places.place.cholula.description",
    category: place.category === "coffee" || place.category === "home" || place.category === "date" ? place.category : "trip",
    categoryKey: place.category === "coffee"
      ? "places.category.coffee"
      : place.category === "home"
        ? "places.category.home"
        : place.category === "date"
          ? "places.category.date"
          : "places.category.trip",
    memories: relatedMemories.map((memory) => ({
      id: String(memory.id),
      titleKey: "places.memory.coffeeAfterRain",
      date: getLocalDateKey(memory.happened_at),
      image: {
        src: memory.primary_media_detail?.url ?? "/images/featured-memory-placeholder.svg",
        altKey: "places.memory.coffeeAfterRain",
        crop: getStoredImageCrop(getMemoryImageCropKey(memory.id)),
      },
    })),
  };
}

export function getMemoryImageCropKey(memoryId: string | number): string {
  return `memory:${memoryId}:primary`;
}

export function getProfileAvatarCropKey(role: ProfileRole): string {
  return `profile:${role}:avatar`;
}

export function getPlaceCoverCropKey(placeId: string | number): string {
  return `place:${placeId}:cover`;
}
