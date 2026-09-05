import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCoupleHeroImage,
  createIntimacyRecord,
  createMemory,
  createMemoryMedia,
  deleteCoupleHeroImage,
  deleteIntimacyRecord,
  deleteMemory,
  deleteMemoryMedia,
  ensureDefaultCouple,
  listCoupleHeroImages,
  listFeaturedMemories,
  listIntimacyRecords,
  listMemories,
  getMemory,
  listPlaces,
  queryKeys,
  updateCoupleHeroImage,
  updateIntimacyRecord,
  updateCoupleMember,
  updateMemory,
  updateMemoryMedia,
  uploadMedia,
  type MemoryListParams,
} from "./resources";
import type {
  ApiCoupleHeroImage,
  ApiCoupleMember,
  IntimacyDraftPayload,
  MemoryDraftPayload,
  MemoryMediaMetadataPayload,
} from "./types";

export function useDefaultCouple() {
  return useQuery({
    queryKey: queryKeys.couples,
    queryFn: ensureDefaultCouple,
    staleTime: 60_000,
  });
}

export function useCoupleHeroImages(coupleId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.coupleHeroImages(coupleId),
    queryFn: () => listCoupleHeroImages(coupleId as number),
    enabled: Boolean(coupleId),
    staleTime: 60_000,
  });
}

export function useMemories(params: MemoryListParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.memories(params),
    queryFn: ({ pageParam }) => listMemories({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => lastPage.next ? allPages.length + 1 : undefined,
    staleTime: 20_000,
  });
}

export function useMemory(memoryId: number) {
  return useQuery({
    queryKey: queryKeys.memory(memoryId),
    queryFn: () => getMemory(memoryId),
    staleTime: 20_000,
  });
}

export function useFeaturedMemories(date: string, timezoneOffset: number) {
  return useQuery({
    queryKey: queryKeys.featuredMemories(date, timezoneOffset),
    queryFn: () => listFeaturedMemories(date, timezoneOffset),
    staleTime: 60_000,
  });
}

export function usePlaces() {
  return useQuery({
    queryKey: queryKeys.places,
    queryFn: listPlaces,
    staleTime: 30_000,
  });
}

export function useIntimacyRecords() {
  return useQuery({
    queryKey: queryKeys.intimacyRecords,
    queryFn: listIntimacyRecords,
    staleTime: 20_000,
  });
}

export function useIntimacyMutations() {
  const queryClient = useQueryClient();

  function invalidateIntimacyRecords() {
    return queryClient.invalidateQueries({ queryKey: queryKeys.intimacyRecords });
  }

  return {
    createRecord: useMutation({
      mutationFn: createIntimacyRecord,
      onSuccess: invalidateIntimacyRecords,
    }),
    updateRecord: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<IntimacyDraftPayload> & { is_favorite?: boolean } }) =>
        updateIntimacyRecord(id, payload),
      onSuccess: invalidateIntimacyRecords,
    }),
    deleteRecord: useMutation({
      mutationFn: deleteIntimacyRecord,
      onSuccess: invalidateIntimacyRecords,
    }),
  };
}

export function useMemoryMutations() {
  const queryClient = useQueryClient();

  function invalidateMemories() {
    queryClient.invalidateQueries({ queryKey: ["memories"] });
    queryClient.invalidateQueries({ queryKey: ["featured-memories"] });
    return queryClient.invalidateQueries({ queryKey: queryKeys.places });
  }

  return {
    uploadMedia: useMutation({
      mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
        uploadMedia(file, onProgress),
    }),
    createMemory: useMutation({
      mutationFn: createMemory,
      onSuccess: invalidateMemories,
    }),
    updateMemory: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<MemoryDraftPayload> & { is_favorite?: boolean } }) =>
        updateMemory(id, payload),
      onSuccess: (memory) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.memory(memory.id) });
        return invalidateMemories();
      },
    }),
    deleteMemory: useMutation({
      mutationFn: deleteMemory,
      onSuccess: invalidateMemories,
    }),
    deleteMemoryMedia: useMutation({
      mutationFn: deleteMemoryMedia,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["memory"] });
        return invalidateMemories();
      },
    }),
    updateMemoryMedia: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: MemoryMediaMetadataPayload }) =>
        updateMemoryMedia(id, payload),
      onSuccess: (memoryMedia) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.memory(memoryMedia.memory) });
        return invalidateMemories();
      },
    }),
    createMemoryMedia: useMutation({
      mutationFn: createMemoryMedia,
      onSuccess: (memoryMedia) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.memory(memoryMedia.memory) });
        return invalidateMemories();
      },
    }),
  };
}

export function useProfileMutations() {
  const queryClient = useQueryClient();

  function invalidateProfile(coupleId?: number) {
    queryClient.invalidateQueries({ queryKey: queryKeys.couples });
    if (coupleId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupleHeroImages(coupleId) });
    } else {
      queryClient.invalidateQueries({ queryKey: ["couple-hero-images"] });
    }
  }

  return {
    uploadMedia: useMutation({
      mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
        uploadMedia(file, onProgress),
    }),
    updateMember: useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<ApiCoupleMember> }) =>
        updateCoupleMember(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.couples }),
    }),
    createHeroImage: useMutation({
      mutationFn: createCoupleHeroImage,
      onSuccess: (heroImage) => invalidateProfile(heroImage.couple),
    }),
    updateHeroImage: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: number;
        payload: Partial<Pick<ApiCoupleHeroImage, "crop" | "sort_order">>;
      }) => updateCoupleHeroImage(id, payload),
      onSuccess: (heroImage) => invalidateProfile(heroImage.couple),
    }),
    deleteHeroImage: useMutation({
      mutationFn: ({ id }: { id: number; coupleId: number }) => deleteCoupleHeroImage(id),
      onSuccess: (_data, variables) => invalidateProfile(variables.coupleId),
    }),
  };
}
