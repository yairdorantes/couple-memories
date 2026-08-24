import type { MemoryCategoryId, MemoryEntry } from "../data/memoriesContent";
import type { ProfileRole } from "../data/profileContent";
import type { ImageCrop } from "../utils/imageCrop";

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ApiMediaAsset = {
  id: number;
  kind: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  secure_url: string;
  optimized_url: string;
  url: string;
  created_at: string;
  updated_at: string;
};

export type ApiCoupleMember = {
  id: number;
  couple: number;
  role: ProfileRole;
  name: string;
  birthday: string | null;
  accent_color: string;
  description: string;
  status_note: string;
  avatar: number | null;
  avatar_detail?: ApiMediaAsset | null;
  created_at: string;
  updated_at: string;
};

export type ApiCouple = {
  id: number;
  name: string;
  anniversary_date: string | null;
  members: ApiCoupleMember[];
  created_at: string;
  updated_at: string;
};

export type ApiCoupleHeroImage = {
  id: number;
  couple: number;
  media: number;
  media_detail?: ApiMediaAsset | null;
  crop: ImageCrop;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ApiPlace = {
  id: number;
  couple: number;
  name: string;
  description: string;
  category: string;
  latitude: string;
  longitude: string;
  cover_media: number | null;
  cover_media_detail?: ApiMediaAsset | null;
  memory_count?: number;
  created_at: string;
  updated_at: string;
};

export type ApiMemory = {
  id: number;
  couple: number;
  title: string;
  caption: string;
  location_name: string;
  latitude: string | null;
  longitude: string | null;
  mood_emoji: string;
  category: Exclude<MemoryCategoryId, "all">;
  happened_at: string;
  is_favorite: boolean;
  place: number | null;
  place_detail?: ApiPlace | null;
  primary_media: number | null;
  primary_media_detail?: ApiMediaAsset | null;
  created_at: string;
  updated_at: string;
};

export type ApiIntimacyRecord = {
  id: number;
  couple: number;
  title: string;
  happened_at: string;
  place: string;
  mood: "tender" | "passionate" | "quiet" | "special";
  note: string;
  is_favorite: boolean;
  created_by_role: "" | "her" | "him";
  updated_by_role: "" | "her" | "him";
  created_at: string;
  updated_at: string;
};

export type MemoryDraftPayload = {
  couple: number;
  title: string;
  caption: string;
  location_name: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  mood_emoji: string;
  category: MemoryEntry["categoryId"];
  happened_at: string;
  primary_media?: number | null;
};

export type IntimacyDraftPayload = {
  couple: number;
  title: string;
  happened_at: string;
  place: string;
  mood: ApiIntimacyRecord["mood"];
  note: string;
  is_favorite?: boolean;
};
