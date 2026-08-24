import { ImagePlus, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  memoryCategories,
  type MemoryCategoryId,
  type MemoryEntry,
} from "../data/memoriesContent";
import { useI18n } from "../i18n/I18nContext";
import { ImageCropControls } from "./ImageCropControls";
import { PositionedImage } from "./PositionedImage";
import { defaultImageCrop, type ImageCrop } from "../utils/imageCrop";
import { toLocalDateTimeInputValue } from "../utils/dateTime";

type MemoryDraft = {
  title: string;
  caption: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  categoryId: Exclude<MemoryCategoryId, "all">;
  moodEmoji: string;
  dateTime: string;
  image: {
    src: string;
    alt: string;
    crop: ImageCrop;
  };
  photoFile?: File;
};

type MemoryFormModalProps = {
  isOpen: boolean;
  initialMemory?: MemoryEntry | null;
  errorMessage?: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (memory: MemoryDraft) => void;
  uploadProgress?: number;
};

const moodEmojis = ["❤️", "☕", "🌅", "🍿", "💐", "🚗", "🏖️"];
const maxPhotoSizeBytes = 12 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export function MemoryFormModal({
  errorMessage,
  isOpen,
  isSaving = false,
  initialMemory,
  onClose,
  onSave,
  uploadProgress,
}: MemoryFormModalProps) {
  const { t } = useI18n();
  const isEditing = Boolean(initialMemory);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [categoryId, setCategoryId] =
    useState<Exclude<MemoryCategoryId, "all">>("travel");
  const [moodEmoji, setMoodEmoji] = useState("❤️");
  const [dateTime, setDateTime] = useState(() =>
    toLocalDateTimeInputValue(new Date()),
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [photoName, setPhotoName] = useState("");
  const [imageCrop, setImageCrop] = useState<ImageCrop>(defaultImageCrop);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [coordinatesError, setCoordinatesError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialMemory) {
      setTitle(initialMemory.title);
      setCaption(initialMemory.caption);
      setLocation(initialMemory.location);
      setLatitude(formatCoordinateInput(initialMemory.latitude));
      setLongitude(formatCoordinateInput(initialMemory.longitude));
      setCategoryId(initialMemory.categoryId);
      setMoodEmoji(initialMemory.moodEmoji);
      setDateTime(initialMemory.dateTime);
      setPhotoPreview(initialMemory.image.src);
      setPhotoName("");
      setImageCrop(initialMemory.image.crop ?? defaultImageCrop);
      setPhotoFile(undefined);
      setSelectedPhotoUrl(null);
      setPhotoError("");
      setCoordinatesError("");
      return;
    }

    setTitle("");
    setCaption("");
    setLocation("");
    setLatitude("");
    setLongitude("");
    setCategoryId("travel");
    setMoodEmoji("❤️");
    setDateTime(toLocalDateTimeInputValue(new Date()));
    setPhotoPreview(null);
    setPhotoFile(undefined);
    setPhotoName("");
    setImageCrop(defaultImageCrop);
    setSelectedPhotoUrl(null);
    setPhotoError("");
    setCoordinatesError("");
  }, [initialMemory, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (selectedPhotoUrl) {
      URL.revokeObjectURL(selectedPhotoUrl);
    }

    setPhotoPreview(null);
    setPhotoFile(undefined);
    setPhotoName("");
    setImageCrop(defaultImageCrop);
    setSelectedPhotoUrl(null);
    setPhotoError("");
    onClose();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!acceptedPhotoTypes.has(file.type)) {
      setPhotoError("Use a JPG, PNG, WEBP, or HEIC image.");
      return;
    }

    if (file.size > maxPhotoSizeBytes) {
      setPhotoError("Choose an image under 12 MB.");
      return;
    }

    if (selectedPhotoUrl) {
      URL.revokeObjectURL(selectedPhotoUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setPhotoPreview(objectUrl);
    setPhotoFile(file);
    setSelectedPhotoUrl(objectUrl);
    setPhotoName(file.name);
    setImageCrop(defaultImageCrop);
    setPhotoError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedCaption = caption.trim();
    const trimmedLocation = location.trim();
    const coordinates = parseCoordinates(latitude, longitude);

    if (coordinates.error) {
      setCoordinatesError(coordinates.error);
      return;
    }

    setCoordinatesError("");

    onSave({
      title: trimmedTitle || "Nuevo recuerdo",
      caption: trimmedCaption || "Un momento para guardar.",
      location: trimmedLocation || "Lugar especial",
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      categoryId,
      moodEmoji,
      dateTime,
      image: {
        src: photoPreview ?? "",
        alt: trimmedTitle || "Memory photo",
        crop: imageCrop,
      },
      photoFile,
    });

    if (selectedPhotoUrl) {
      URL.revokeObjectURL(selectedPhotoUrl);
    }

    setTitle("");
    setCaption("");
    setLocation("");
    setLatitude("");
    setLongitude("");
    setCategoryId("travel");
    setMoodEmoji("❤️");
    setPhotoPreview(null);
    setPhotoFile(undefined);
    setPhotoName("");
    setImageCrop(defaultImageCrop);
    setSelectedPhotoUrl(null);
  }

  return (
    <div className='memory-modal-backdrop' role='presentation'>
      <form
        className='memory-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='memory-modal-title'
        onSubmit={handleSubmit}
      >
        <div className='memory-modal-header'>
          <h2 id='memory-modal-title'>
            {t(isEditing ? "memoryForm.editTitle" : "memoryForm.title")} 📸
          </h2>
          <button
            className='memory-modal-close'
            type='button'
            aria-label={t("memoryForm.cancel")}
            onClick={handleClose}
          >
            <X className='h-5 w-5' aria-hidden='true' />
          </button>
        </div>

        <label className='memory-modal-field'>
          <span>{t("memoryForm.titleLabel")}</span>
          <input
            value={title}
            placeholder={t("memoryForm.titlePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className='memory-modal-field'>
          <span>{t("memoryForm.captionLabel")}</span>
          <textarea
            value={caption}
            placeholder={t("memoryForm.captionPlaceholder")}
            onChange={(event) => setCaption(event.target.value)}
          />
        </label>

        <label className='memory-modal-field'>
          <span>{t("memoryForm.locationLabel")}</span>
          <input
            value={location}
            placeholder={t("memoryForm.locationPlaceholder")}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>

        <fieldset className='memory-modal-field memory-modal-coordinates'>
          <legend>{t("memoryForm.coordinatesLabel")}</legend>
          <div>
            <label>
              <span>{t("memoryForm.latitudeLabel")}</span>
              <input
                type='number'
                inputMode='decimal'
                min='-90'
                max='90'
                step='0.000001'
                value={latitude}
                placeholder='19.043300'
                onChange={(event) => setLatitude(event.target.value)}
              />
            </label>
            <label>
              <span>{t("memoryForm.longitudeLabel")}</span>
              <input
                type='number'
                inputMode='decimal'
                min='-180'
                max='180'
                step='0.000001'
                value={longitude}
                placeholder='-98.201900'
                onChange={(event) => setLongitude(event.target.value)}
              />
            </label>
          </div>
          <small>{t("memoryForm.coordinatesHint")}</small>
          {coordinatesError ? (
            <small className='memory-modal-error'>{coordinatesError}</small>
          ) : null}
        </fieldset>

        <div className='memory-modal-photo-field'>
          <span>{t("memoryForm.photoLabel")}</span>
          <label className='memory-modal-photo-picker'>
            <input
              type='file'
              accept='image/jpeg,image/png,image/webp,image/heic'
              disabled={isSaving}
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <PositionedImage src={photoPreview} alt={photoName} crop={imageCrop} />
            ) : (
              <span>
                <ImagePlus className='h-5 w-5' aria-hidden='true' />
                {t("memoryForm.photoButton")}
              </span>
            )}
          </label>
          {photoName ? (
            <small>
              {t("memoryForm.photoSelected")}: {photoName}
            </small>
          ) : null}
          {photoError ? <small className='memory-modal-error'>{photoError}</small> : null}
          {photoPreview ? (
            <ImageCropControls
              crop={imageCrop}
              labels={{
                title: t("imageCrop.title"),
                x: t("imageCrop.x"),
                y: t("imageCrop.y"),
                zoom: t("imageCrop.zoom"),
                cover: t("imageCrop.cover"),
                contain: t("imageCrop.contain"),
                reset: t("imageCrop.reset"),
              }}
              onChange={setImageCrop}
            />
          ) : null}
          {typeof uploadProgress === "number" && uploadProgress > 0 && uploadProgress < 100 ? (
            <div className='memory-upload-progress' aria-label='Upload progress'>
              <span style={{ width: `${uploadProgress}%` }} />
            </div>
          ) : null}
        </div>

        <label className='memory-modal-field'>
          <span>{t("memoryForm.dateLabel")}</span>
          <input
            type='datetime-local'
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
          />
        </label>

        <fieldset className='memory-modal-options'>
          <legend>{t("memoryForm.categoryLabel")}</legend>
          <div>
            {memoryCategories
              .filter((category) => category.id !== "all")
              .map((category) => (
                <button
                  key={category.id}
                  className={
                    categoryId === category.id ? "is-active" : undefined
                  }
                  type='button'
                  onClick={() =>
                    setCategoryId(
                      category.id as Exclude<MemoryCategoryId, "all">,
                    )
                  }
                >
                  {t(category.labelKey)}
                </button>
              ))}
          </div>
        </fieldset>

        <fieldset className='memory-modal-options'>
          <legend>{t("memoryForm.emojiLabel")}</legend>
          <div className='memory-modal-emoji-row'>
            {moodEmojis.map((emoji) => (
              <button
                key={emoji}
                className={moodEmoji === emoji ? "is-active" : undefined}
                type='button'
                onClick={() => setMoodEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </fieldset>

        <div className='memory-modal-actions'>
          {errorMessage ? <p className='memory-modal-error'>{errorMessage}</p> : null}
          <button type='button' disabled={isSaving} onClick={handleClose}>
            {t("memoryForm.cancel")}
          </button>
          <button type='submit' disabled={isSaving}>
            {isSaving ? "Saving..." : t(isEditing ? "memoryForm.update" : "memoryForm.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

export type NewMemoryDraft = Parameters<MemoryFormModalProps["onSave"]>[0];

function formatCoordinateInput(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function parseCoordinates(
  latitudeInput: string,
  longitudeInput: string,
): { latitude: number | null; longitude: number | null; error?: string } {
  const trimmedLatitude = latitudeInput.trim();
  const trimmedLongitude = longitudeInput.trim();

  if (!trimmedLatitude && !trimmedLongitude) {
    return { latitude: null, longitude: null };
  }

  if (!trimmedLatitude || !trimmedLongitude) {
    return {
      latitude: null,
      longitude: null,
      error: "Add both latitude and longitude, or leave both empty.",
    };
  }

  const parsedLatitude = Number(trimmedLatitude);
  const parsedLongitude = Number(trimmedLongitude);

  if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
    return {
      latitude: null,
      longitude: null,
      error: "Latitude must be between -90 and 90.",
    };
  }

  if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
    return {
      latitude: null,
      longitude: null,
      error: "Longitude must be between -180 and 180.",
    };
  }

  return { latitude: parsedLatitude, longitude: parsedLongitude };
}
