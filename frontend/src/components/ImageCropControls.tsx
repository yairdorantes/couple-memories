import { Maximize2 } from "lucide-react";
import { normalizeImageCrop, type ImageCrop } from "../utils/imageCrop";

type ImageCropControlsProps = {
  crop: ImageCrop;
  className?: string;
  labels: {
    title: string;
    x: string;
    y: string;
    zoom: string;
    cover: string;
    contain: string;
    reset: string;
  };
  onChange: (crop: ImageCrop) => void;
};

export function ImageCropControls({ className, crop, labels, onChange }: ImageCropControlsProps) {
  const normalizedCrop = normalizeImageCrop(crop);

  function updateCrop(nextCrop: Partial<ImageCrop>) {
    onChange(normalizeImageCrop({ ...normalizedCrop, ...nextCrop }));
  }

  return (
    <fieldset className={["image-crop-controls", className].filter(Boolean).join(" ")}>
      <legend>
        <Maximize2 aria-hidden='true' />
        {labels.title}
      </legend>
      <div className='image-crop-fit-toggle' role='group' aria-label={labels.title}>
        {(["cover", "contain"] as const).map((fit) => (
          <button
            key={fit}
            className={normalizedCrop.fit === fit ? "is-active" : undefined}
            type='button'
            onClick={() => updateCrop({ fit })}
          >
            {fit === "cover" ? labels.cover : labels.contain}
          </button>
        ))}
      </div>
      <ImageCropSlider
        label={labels.x}
        min={0}
        max={100}
        step={1}
        value={normalizedCrop.x}
        onChange={(value) => updateCrop({ x: value })}
      />
      <ImageCropSlider
        label={labels.y}
        min={0}
        max={100}
        step={1}
        value={normalizedCrop.y}
        onChange={(value) => updateCrop({ y: value })}
      />
      <ImageCropSlider
        label={labels.zoom}
        min={1}
        max={3}
        step={0.05}
        value={normalizedCrop.zoom}
        onChange={(value) => updateCrop({ zoom: value })}
      />
      <button
        className='image-crop-reset'
        type='button'
        onClick={() => onChange(normalizeImageCrop({ fit: normalizedCrop.fit }))}
      >
        {labels.reset}
      </button>
    </fieldset>
  );
}

type ImageCropSliderProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function ImageCropSlider({ label, min, max, onChange, step, value }: ImageCropSliderProps) {
  return (
    <label className='image-crop-slider'>
      <span>
        {label}
        <strong>{formatCropValue(value)}</strong>
      </span>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function formatCropValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
