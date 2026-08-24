import type { CSSProperties } from "react";

export type ImageFitMode = "cover" | "contain";

export type ImageCrop = {
  x: number;
  y: number;
  zoom: number;
  fit: ImageFitMode;
};

export const defaultImageCrop: ImageCrop = {
  x: 50,
  y: 50,
  zoom: 1,
  fit: "cover",
};

export function normalizeImageCrop(crop?: Partial<ImageCrop> | null): ImageCrop {
  return {
    x: clampPercent(crop?.x ?? defaultImageCrop.x),
    y: clampPercent(crop?.y ?? defaultImageCrop.y),
    zoom: clampZoom(crop?.zoom ?? defaultImageCrop.zoom),
    fit: crop?.fit === "contain" ? "contain" : "cover",
  };
}

export function getImageCropStyle(crop?: Partial<ImageCrop> | null): CSSProperties {
  const normalizedCrop = normalizeImageCrop(crop);

  return {
    "--image-crop-x": `${normalizedCrop.x}%`,
    "--image-crop-y": `${normalizedCrop.y}%`,
    "--image-crop-zoom": normalizedCrop.zoom,
    "--image-crop-fit": normalizedCrop.fit,
  } as CSSProperties;
}

export function getStoredImageCrop(key: string): ImageCrop | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const rawCrop = window.localStorage.getItem(getImageCropStorageKey(key));
    return rawCrop ? normalizeImageCrop(JSON.parse(rawCrop) as Partial<ImageCrop>) : undefined;
  } catch {
    return undefined;
  }
}

export function saveStoredImageCrop(key: string, crop: ImageCrop): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getImageCropStorageKey(key),
      JSON.stringify(normalizeImageCrop(crop)),
    );
  } catch {
    // Cropping is a visual preference; saving the core record should not depend on it.
  }
}

export function getImageCropStorageKey(key: string): string {
  return `couple-memories:image-crop:${key}`;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.min(100, Math.max(0, value));
}

function clampZoom(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(3, Math.max(1, value));
}
