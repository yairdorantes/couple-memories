import { getImageCropStyle, type ImageCrop } from "../utils/imageCrop";
import type { CSSProperties } from "react";

type PositionedImageProps = {
  src: string;
  alt: string;
  crop?: Partial<ImageCrop> | null;
  className?: string;
  loading?: "eager" | "lazy";
  style?: CSSProperties;
};

export function PositionedImage({
  alt,
  className,
  crop,
  loading = "lazy",
  src,
  style,
}: PositionedImageProps) {
  return (
    <span
      className={["positioned-image-frame", className].filter(Boolean).join(" ")}
      style={{ ...getImageCropStyle(crop), ...style }}
    >
      <img
        className='positioned-image-media'
        src={src}
        alt={alt}
        loading={loading}
      />
    </span>
  );
}
