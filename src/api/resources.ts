import { defaultProfile } from "../data/profileContent";
import type { MemoryCategoryId } from "../data/memoriesContent";
import { apiRequest, uploadFile } from "./client";
import type {
  ApiCouple,
  ApiCoupleHeroImage,
  ApiCoupleMember,
  ApiIntimacyRecord,
  ApiMediaAsset,
  ApiMemory,
  ApiMemoryMedia,
  ApiPlace,
  IntimacyDraftPayload,
  MemoryDraftPayload,
  MemoryMediaDraftPayload,
  MemoryMediaMetadataPayload,
  PaginatedResponse,
} from "./types";

export const queryKeys = {
  couples: ["couples"] as const,
  coupleHeroImages: (coupleId: number | undefined) => ["couple-hero-images", coupleId] as const,
  featuredMemories: (date: string, timezoneOffset: number) => ["featured-memories", date, timezoneOffset] as const,
  intimacyRecords: ["intimacy-records"] as const,
  memories: (params: MemoryListParams) => ["memories", params] as const,
  memory: (memoryId: number) => ["memory", memoryId] as const,
  places: ["places"] as const,
};

export type MemoryListParams = {
  category: MemoryCategoryId;
  search: string;
  page?: number;
};

export async function listCouples(): Promise<ApiCouple[]> {
  const response = await apiRequest<PaginatedResponse<ApiCouple>>("/couples/");
  return response.results;
}

export async function ensureDefaultCouple(): Promise<ApiCouple> {
  const couples = await listCouples();
  if (couples[0]) {
    await ensureCoupleMembers(couples[0]);
    const refreshedCouples = await listCouples();
    return refreshedCouples[0] ?? couples[0];
  }

  const createdCouple = await apiRequest<ApiCouple>("/couples/", {
    method: "POST",
    body: JSON.stringify({
      name: `${defaultProfile.people.her.name} & ${defaultProfile.people.him.name}`,
      anniversary_date: "2026-01-10",
    }),
  });

  const refreshedCouples = await listCouples();
  const couple = refreshedCouples[0] ?? createdCouple;
  await ensureCoupleMembers(couple);
  const finalCouples = await listCouples();
  return finalCouples[0] ?? couple;
}

async function ensureCoupleMembers(couple: ApiCouple): Promise<void> {
  const existingRoles = new Set(couple.members.map((member) => member.role));

  await Promise.all(
    (["her", "him"] as const)
      .filter((role) => !existingRoles.has(role))
      .map((role) =>
        apiRequest<ApiCoupleMember>("/couple-members/", {
          method: "POST",
          body: JSON.stringify({
            couple: couple.id,
            role,
            name: defaultProfile.people[role].name,
            birthday: defaultProfile.people[role].birthday || null,
            accent_color: defaultProfile.people[role].accentColor,
            description: defaultProfile.people[role].description,
            status_note: defaultProfile.people[role].statusNote,
          }),
        }),
      ),
  );
}

export async function updateCoupleMember(
  memberId: number,
  payload: Partial<ApiCoupleMember>,
): Promise<ApiCoupleMember> {
  return apiRequest<ApiCoupleMember>(`/couple-members/${memberId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listCoupleHeroImages(coupleId: number): Promise<ApiCoupleHeroImage[]> {
  const response = await apiRequest<PaginatedResponse<ApiCoupleHeroImage>>(
    "/couple-hero-images/",
    {
      params: { couple: coupleId },
    },
  );
  return response.results;
}

export async function createCoupleHeroImage(payload: {
  couple: number;
  media: number;
  crop: ApiCoupleHeroImage["crop"];
  sort_order?: number;
}): Promise<ApiCoupleHeroImage> {
  return apiRequest<ApiCoupleHeroImage>("/couple-hero-images/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCoupleHeroImage(
  heroImageId: number,
  payload: Partial<Pick<ApiCoupleHeroImage, "crop" | "sort_order">>,
): Promise<ApiCoupleHeroImage> {
  return apiRequest<ApiCoupleHeroImage>(`/couple-hero-images/${heroImageId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCoupleHeroImage(heroImageId: number): Promise<void> {
  await apiRequest<void>(`/couple-hero-images/${heroImageId}/`, {
    method: "DELETE",
  });
}

export async function listIntimacyRecords(): Promise<PaginatedResponse<ApiIntimacyRecord>> {
  return apiRequest<PaginatedResponse<ApiIntimacyRecord>>("/intimacy-records/");
}

export async function createIntimacyRecord(payload: IntimacyDraftPayload): Promise<ApiIntimacyRecord> {
  return apiRequest<ApiIntimacyRecord>("/intimacy-records/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateIntimacyRecord(
  recordId: string,
  payload: Partial<IntimacyDraftPayload> & { is_favorite?: boolean },
): Promise<ApiIntimacyRecord> {
  return apiRequest<ApiIntimacyRecord>(`/intimacy-records/${recordId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteIntimacyRecord(recordId: string): Promise<void> {
  await apiRequest<void>(`/intimacy-records/${recordId}/`, {
    method: "DELETE",
  });
}

export async function listMemories(params: MemoryListParams): Promise<PaginatedResponse<ApiMemory>> {
  return apiRequest<PaginatedResponse<ApiMemory>>("/memories/", {
    params: {
      page: params.page ?? 1,
      category: params.category === "all" ? undefined : params.category,
      search: params.search.trim() || undefined,
    },
  });
}

export async function listFeaturedMemories(date: string, timezoneOffset: number): Promise<ApiMemory[]> {
  return apiRequest<ApiMemory[]>("/memories/featured/", {
    params: {
      date,
      limit: 3,
      timezone_offset: timezoneOffset,
    },
  });
}

export async function getMemory(memoryId: number): Promise<ApiMemory> {
  return apiRequest<ApiMemory>(`/memories/${memoryId}/`);
}

export async function createMemory(payload: MemoryDraftPayload): Promise<ApiMemory> {
  return apiRequest<ApiMemory>("/memories/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMemory(memoryId: string, payload: Partial<MemoryDraftPayload> & { is_favorite?: boolean }): Promise<ApiMemory> {
  return apiRequest<ApiMemory>(`/memories/${memoryId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMemory(memoryId: string): Promise<void> {
  await apiRequest<void>(`/memories/${memoryId}/`, {
    method: "DELETE",
  });
}

export async function createMemoryMedia(payload: MemoryMediaDraftPayload): Promise<ApiMemoryMedia> {
  return apiRequest<ApiMemoryMedia>("/memory-media/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMemoryMedia(
  memoryMediaId: number,
  payload: MemoryMediaMetadataPayload,
): Promise<ApiMemoryMedia> {
  return apiRequest<ApiMemoryMedia>(`/memory-media/${memoryMediaId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMemoryMedia(memoryMediaId: number): Promise<void> {
  await apiRequest<void>(`/memory-media/${memoryMediaId}/`, {
    method: "DELETE",
  });
}

export async function listPlaces(): Promise<ApiPlace[]> {
  const response = await apiRequest<PaginatedResponse<ApiPlace>>("/places/");
  return response.results;
}

export async function uploadMedia(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ApiMediaAsset> {
  return uploadFile<ApiMediaAsset>("/media/", file, onProgress);
}
