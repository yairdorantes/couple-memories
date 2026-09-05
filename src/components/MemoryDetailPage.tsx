import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Images,
  MapPin,
  Pencil,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { useMemory, useMemoryMutations } from "../api/hooks";
import type { ApiMemory, ApiMemoryMedia } from "../api/types";
import { getFriendlyError } from "../api/utils";
import { useI18n } from "../i18n/I18nContext";
import { getDateForDisplay, toIsoStringFromLocalInput, toLocalDateTimeInputValue } from "../utils/dateTime";
import { FloatingHearts } from "./FloatingHearts";
import { PositionedImage } from "./PositionedImage";
import { useToast } from "./ui/toastContext";

type MemoryDetailPageProps = {
  memoryId: number;
  onBack: () => void;
};

type GalleryPhoto = {
  id: string;
  type: "primary" | "linked";
  memoryMediaId?: number;
  src: string;
  alt: string;
  caption: string;
  date: string | null;
  location: string;
  latitude: string | null;
  longitude: string | null;
};

const fallbackImageSrc = "/images/featured-memory-placeholder.svg";
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const categoryLabelKeys = {
  travel: "memories.categories.travel",
  food: "memories.categories.food",
  movie: "memories.categories.movie",
  coffee: "memories.categories.coffee",
} as const;

export function MemoryDetailPage({ memoryId, onBack }: MemoryDetailPageProps) {
  const { language, t } = useI18n();
  const { showToast } = useToast();
  const memoryQuery = useMemory(memoryId);
  const memoryMutations = useMemoryMutations();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);

  if (memoryQuery.isLoading) {
    return <MemoryDetailShell><p className="memory-detail-status">{t("memoryDetail.loading")}</p></MemoryDetailShell>;
  }

  if (memoryQuery.isError || !memoryQuery.data) {
    return (
      <MemoryDetailShell>
        <section className="memory-detail-empty">
          <h1>{t("memoryDetail.notFoundTitle")}</h1>
          <p>{memoryQuery.isError ? getFriendlyError(memoryQuery.error) : t("memoryDetail.notFoundCopy")}</p>
          <button type="button" onClick={onBack}>{t("memoryDetail.backToMemories")}</button>
        </section>
      </MemoryDetailShell>
    );
  }

  const memory = memoryQuery.data;
  const photos = getGalleryPhotos(memory);
  const selectedPhoto = selectedPhotoIndex === null ? undefined : photos[selectedPhotoIndex];

  function closeLightbox() {
    setSelectedPhotoIndex(null);
  }

  function showPreviousPhoto() {
    setSelectedPhotoIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    });
  }

  function showNextPhoto() {
    setSelectedPhotoIndex((currentIndex) => {
      if (currentIndex === null) return currentIndex;
      return currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    });
  }

  async function handleUploadPhoto(draft: PhotoDraft) {
    try {
      const uploadedMedia = await memoryMutations.uploadMedia.mutateAsync({ file: draft.file });
      await memoryMutations.createMemoryMedia.mutateAsync({
        memory: memory.id,
        media: uploadedMedia.id,
        sort_order: memory.media_links.length + 1,
        caption: draft.caption,
        taken_at: draft.takenAt ? toIsoStringFromLocalInput(draft.takenAt) : null,
        location_name: draft.location,
        latitude: draft.latitude,
        longitude: draft.longitude,
      });
      setIsUploadOpen(false);
      showToast(t("memoryDetail.added"), "success");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  async function handleDeletePhoto(photo: GalleryPhoto) {
    const shouldDelete = window.confirm(
      t("memoryDetail.removeConfirm"),
    );
    if (!shouldDelete) {
      return;
    }

    try {
      if (photo.type === "primary") {
        await memoryMutations.updateMemory.mutateAsync({
          id: String(memory.id),
          payload: { primary_media: null },
        });
      } else if (photo.memoryMediaId) {
        await memoryMutations.deleteMemoryMedia.mutateAsync(photo.memoryMediaId);
      }
      closeLightbox();
      showToast(t("memoryDetail.removed"), "success");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  async function handleUpdatePhoto(draft: PhotoMetadataDraft) {
    const photo = editingPhoto;
    if (!photo) {
      return;
    }

    try {
      if (photo.type === "primary") {
        await memoryMutations.updateMemory.mutateAsync({
          id: String(memory.id),
          payload: {
            caption: draft.caption,
            happened_at: draft.takenAt ? toIsoStringFromLocalInput(draft.takenAt) : memory.happened_at,
            location_name: draft.location,
            latitude: draft.latitude,
            longitude: draft.longitude,
          },
        });
      } else if (photo.memoryMediaId) {
        await memoryMutations.updateMemoryMedia.mutateAsync({
          id: photo.memoryMediaId,
          payload: {
            caption: draft.caption,
            taken_at: draft.takenAt ? toIsoStringFromLocalInput(draft.takenAt) : null,
            location_name: draft.location,
            latitude: draft.latitude,
            longitude: draft.longitude,
          },
        });
      }
      setEditingPhoto(null);
      showToast(t("memoryDetail.updated"), "success");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  const isDeletingPhoto =
    memoryMutations.updateMemory.isPending || memoryMutations.deleteMemoryMedia.isPending;
  const isUpdatingPhoto =
    memoryMutations.updateMemory.isPending || memoryMutations.updateMemoryMedia.isPending;

  return (
    <MemoryDetailShell>
      <div className="memory-detail-shell">
        <header className="memory-detail-topbar">
          <button className="memory-detail-back" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            <span>{t("memoryDetail.back")}</span>
          </button>
          <span className="memory-detail-topbar-count">{t("memoryDetail.photoCount", photos.length)}</span>
        </header>

        <section className="memory-detail-hero">
          <PositionedImage
            className="memory-detail-cover"
            src={memory.primary_media_detail?.url ?? photos[0]?.src ?? fallbackImageSrc}
            alt={memory.title}
          />
          <div className="memory-detail-cover-shade" aria-hidden="true" />
          <div className="memory-detail-intro">
            <span className="memory-detail-mood" aria-hidden="true">{memory.mood_emoji}</span>
            <h1>{memory.title}</h1>
            {memory.caption ? <p>{memory.caption}</p> : null}
            <div className="memory-detail-metadata">
              <span><CalendarDays aria-hidden="true" />{formatDate(memory.happened_at, language)}</span>
              {memory.location_name || memory.place_detail?.name ? (
                <span><MapPin aria-hidden="true" />{memory.location_name || memory.place_detail?.name}</span>
              ) : null}
              <span><Tag aria-hidden="true" />{t(categoryLabelKeys[memory.category])}</span>
            </div>
          </div>
        </section>

        <section className="memory-detail-gallery-section" aria-labelledby="memory-gallery-title">
          <header className="memory-detail-gallery-heading">
            <div className="memory-detail-gallery-copy">
              <p className="memory-detail-gallery-kicker"><Images aria-hidden="true" />{t("memoryDetail.collectionEyebrow")}</p>
              <h2 id="memory-gallery-title">{t("memoryDetail.collectionTitle")}</h2>
            </div>
            <div className="memory-detail-gallery-actions">
              <span className="memory-detail-gallery-count">{t("memoryDetail.photoCount", photos.length)}</span>
              <button className="memory-detail-add-photo" type="button" onClick={() => setIsUploadOpen(true)}>
                <ImagePlus aria-hidden="true" />
                <span>{t("memoryDetail.addPhoto")}</span>
              </button>
            </div>
          </header>

          {photos.length > 0 ? (
            <div className="memory-detail-gallery">
              {photos.map((photo, index) => (
                <article className="memory-detail-photo" key={photo.id}>
                  <button
                    className="memory-detail-photo-open"
                    type="button"
                    onClick={() => setSelectedPhotoIndex(index)}
                    aria-label={t("memoryDetail.openPhoto", index + 1, photos.length)}
                  >
                    <img src={photo.src} alt={photo.alt || t("memoryDetail.photoLabel")} />
                    {photo.location ? <span><MapPin aria-hidden="true" />{photo.location}</span> : null}
                  </button>
                  <button
                    className="memory-detail-photo-edit"
                    type="button"
                    disabled={isUpdatingPhoto}
                    onClick={() => setEditingPhoto(photo)}
                    aria-label={t("memoryDetail.editPhoto", index + 1)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                  <button
                    className="memory-detail-photo-delete"
                    type="button"
                    disabled={isDeletingPhoto}
                    onClick={() => handleDeletePhoto(photo)}
                    aria-label={t("memoryDetail.removePhoto", index + 1)}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="memory-detail-no-photos">
              <ImagePlus aria-hidden="true" />
              <p>{t("memoryDetail.noPhotos")}</p>
            </div>
          )}
        </section>
      </div>

      {selectedPhoto ? (
        <PhotoLightbox
          photo={selectedPhoto}
          photoIndex={selectedPhotoIndex ?? 0}
          photoCount={photos.length}
          onClose={closeLightbox}
          onPrevious={showPreviousPhoto}
          onNext={showNextPhoto}
          onDelete={() => handleDeletePhoto(selectedPhoto)}
          onEdit={() => {
            closeLightbox();
            setEditingPhoto(selectedPhoto);
          }}
          isDeleting={isDeletingPhoto}
          isUpdating={isUpdatingPhoto}
          language={language}
        />
      ) : null}
      {isUploadOpen ? (
        <PhotoUploadDialog
          key={memory.id}
          isSaving={memoryMutations.uploadMedia.isPending || memoryMutations.createMemoryMedia.isPending}
          onClose={() => setIsUploadOpen(false)}
          onSave={handleUploadPhoto}
        />
      ) : null}
      {editingPhoto ? (
        <PhotoMetadataDialog
          key={editingPhoto.id}
          photo={editingPhoto}
          isSaving={isUpdatingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={handleUpdatePhoto}
        />
      ) : null}
    </MemoryDetailShell>
  );
}

function MemoryDetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-ink-950 text-white">
      <FloatingHearts />
      <div className="screen-glow" aria-hidden="true" />
      {children}
    </main>
  );
}

function getGalleryPhotos(memory: ApiMemory): GalleryPhoto[] {
  const primaryMediaId = memory.primary_media;
  const linkedPhotos = memory.media_links
    .filter((link) => link.media !== primaryMediaId)
    .map(toGalleryPhoto);
  const primaryPhoto: GalleryPhoto[] = memory.primary_media_detail?.url
    ? [{
        id: `primary-${memory.primary_media_detail.id}`,
        type: "primary",
        src: memory.primary_media_detail.url,
        alt: memory.title,
        caption: memory.caption,
        date: memory.happened_at,
        location: memory.location_name || memory.place_detail?.name || "",
        latitude: memory.latitude,
        longitude: memory.longitude,
      }]
    : [];

  return [...primaryPhoto, ...linkedPhotos];
}

function toGalleryPhoto(photo: ApiMemoryMedia): GalleryPhoto {
  return {
    id: String(photo.id),
    type: "linked",
    memoryMediaId: photo.id,
    src: photo.media_detail?.url ?? fallbackImageSrc,
    alt: photo.caption || photo.media_detail?.original_filename || "",
    caption: photo.caption,
    date: photo.taken_at,
    location: photo.location_name || photo.place_detail?.name || "",
    latitude: photo.latitude,
    longitude: photo.longitude,
  };
}

function formatDate(dateInput: string, language: string) {
  return new Intl.DateTimeFormat(language, { month: "long", day: "numeric", year: "numeric" }).format(getDateForDisplay(dateInput));
}

type PhotoLightboxProps = {
  photo: GalleryPhoto;
  photoIndex: number;
  photoCount: number;
  language: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isDeleting: boolean;
  isUpdating: boolean;
};

function PhotoLightbox({ photo, photoIndex, photoCount, language, onClose, onPrevious, onNext, onDelete, onEdit, isDeleting, isUpdating }: PhotoLightboxProps) {
  const { t } = useI18n();
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (photoCount < 2) {
      return;
    }
    pointerStartX.current = event.clientX;
    pointerStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (pointerStartX.current === null || pointerStartY.current === null) {
      return;
    }
    const distanceX = event.clientX - pointerStartX.current;
    const distanceY = event.clientY - pointerStartY.current;
    if (Math.abs(distanceX) <= Math.abs(distanceY)) {
      return;
    }
    event.preventDefault();
    setDragOffset(distanceX);
  }

  function handlePointerEnd(event: PointerEvent<HTMLElement>) {
    if (pointerStartX.current === null || pointerStartY.current === null) {
      return;
    }
    const distanceX = event.clientX - pointerStartX.current;
    const distanceY = event.clientY - pointerStartY.current;
    pointerStartX.current = null;
    pointerStartY.current = null;
    setDragOffset(0);

    if (Math.abs(distanceX) < 60 || Math.abs(distanceX) <= Math.abs(distanceY)) {
      return;
    }
    if (distanceX > 0) {
      onPrevious();
      return;
    }
    onNext();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="memory-lightbox" role="dialog" aria-modal="true" aria-label={t("memoryDetail.openPhoto", photoIndex + 1, photoCount)} onClick={handleBackdropClick}>
      <button className="memory-lightbox-close" type="button" onClick={onClose} aria-label={t("memoryDetail.closePhoto")}><X aria-hidden="true" /></button>
      <button className="memory-lightbox-edit" type="button" onClick={onEdit} disabled={isUpdating} aria-label={t("memoryDetail.editPhoto", photoIndex + 1)}><Pencil aria-hidden="true" /></button>
      <button className="memory-lightbox-delete" type="button" onClick={onDelete} disabled={isDeleting} aria-label={t("memoryDetail.removePhoto", photoIndex + 1)}><Trash2 aria-hidden="true" /></button>
      {photoCount > 1 ? <button className="memory-lightbox-nav memory-lightbox-nav--previous" type="button" onClick={onPrevious} aria-label={t("memoryDetail.previousPhoto")}><ChevronLeft aria-hidden="true" /></button> : null}
      <figure
        className="memory-lightbox-figure"
        style={{ transform: `translateX(${dragOffset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <img src={photo.src} alt={photo.alt || t("memoryDetail.photoLabel")} />
        {(photo.caption || photo.date || photo.location) ? (
          <figcaption>
            {photo.caption ? <p>{photo.caption}</p> : null}
            <div>
              {photo.date ? <span><CalendarDays aria-hidden="true" />{formatDate(photo.date, language)}</span> : null}
              {photo.location ? <span><MapPin aria-hidden="true" />{photo.location}</span> : null}
            </div>
          </figcaption>
        ) : null}
      </figure>
      {photoCount > 1 ? <button className="memory-lightbox-nav memory-lightbox-nav--next" type="button" onClick={onNext} aria-label={t("memoryDetail.nextPhoto")}><ChevronRight aria-hidden="true" /></button> : null}
      <span className="memory-lightbox-count">{photoIndex + 1} / {photoCount}</span>
    </div>
  );
}

type PhotoDraft = {
  file: File;
  caption: string;
  takenAt: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
};

type PhotoMetadataDraft = Omit<PhotoDraft, "file">;

type PhotoUploadDialogProps = {
  isSaving: boolean;
  onClose: () => void;
  onSave: (draft: PhotoDraft) => void;
};

function PhotoUploadDialog({ isSaving, onClose, onSave }: PhotoUploadDialogProps) {
  const { t } = useI18n();
  const [file, setFile] = useState<File>();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (!acceptedPhotoTypes.has(selectedFile.type)) {
      setError(t("memoryDetail.photoTypeError"));
      return;
    }
    setFile(selectedFile);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLatitude = latitude.trim() ? Number(latitude) : null;
    const parsedLongitude = longitude.trim() ? Number(longitude) : null;
    if (!file) {
      setError(t("memoryDetail.photoRequired"));
      return;
    }
    if ((parsedLatitude === null) !== (parsedLongitude === null) || (parsedLatitude !== null && (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90)) || (parsedLongitude !== null && (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180))) {
      setError(t("memoryDetail.coordinatesError"));
      return;
    }
    onSave({ file, caption: caption.trim(), takenAt, location: location.trim(), latitude: parsedLatitude, longitude: parsedLongitude });
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (!isSaving && event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="memory-photo-dialog-backdrop" onClick={handleBackdropClick}>
      <form className="memory-photo-dialog" role="dialog" aria-modal="true" aria-labelledby="memory-photo-dialog-title" onSubmit={handleSubmit}>
        <header><h2 id="memory-photo-dialog-title">{t("memoryDetail.addDialogTitle")}</h2><button type="button" onClick={onClose} aria-label={t("memoryDetail.closePhoto")}><X aria-hidden="true" /></button></header>
        <label><span>{t("memoryDetail.photoLabel")}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/heic" disabled={isSaving} onChange={handleFileChange} />{file ? <small>{file.name}</small> : null}</label>
        <label><span>{t("memoryDetail.captionLabel")}</span><textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder={t("memoryDetail.captionPlaceholder")} /></label>
        <label><span>{t("memoryDetail.dateLabel")}</span><input type="datetime-local" value={takenAt} onChange={(event) => setTakenAt(event.target.value)} /></label>
        <label><span>{t("memoryDetail.locationLabel")}</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={t("memoryDetail.locationPlaceholder")} /></label>
        <div className="memory-photo-dialog-coordinates"><label><span>{t("memoryDetail.latitudeLabel")}</span><input type="number" step="0.000001" value={latitude} onChange={(event) => setLatitude(event.target.value)} /></label><label><span>{t("memoryDetail.longitudeLabel")}</span><input type="number" step="0.000001" value={longitude} onChange={(event) => setLongitude(event.target.value)} /></label></div>
        <small>{t("memoryDetail.coordinatesHint")}</small>
        {error ? <p>{error}</p> : null}
        <footer><button type="button" onClick={onClose} disabled={isSaving}>{t("memoryDetail.cancel")}</button><button type="submit" disabled={isSaving}>{isSaving ? t("memoryDetail.addingPhoto") : t("memoryDetail.addPhotoSubmit")}</button></footer>
      </form>
    </div>
  );
}

type PhotoMetadataDialogProps = {
  photo: GalleryPhoto;
  isSaving: boolean;
  onClose: () => void;
  onSave: (draft: PhotoMetadataDraft) => void;
};

function PhotoMetadataDialog({ photo, isSaving, onClose, onSave }: PhotoMetadataDialogProps) {
  const { t } = useI18n();
  const [caption, setCaption] = useState(photo.caption);
  const [location, setLocation] = useState(photo.location);
  const [takenAt, setTakenAt] = useState(
    photo.date ? toLocalDateTimeInputValue(photo.date) : "",
  );
  const [latitude, setLatitude] = useState(photo.latitude ?? "");
  const [longitude, setLongitude] = useState(photo.longitude ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLatitude = latitude.trim() ? Number(latitude) : null;
    const parsedLongitude = longitude.trim() ? Number(longitude) : null;
    if (
      (parsedLatitude === null) !== (parsedLongitude === null)
      || (parsedLatitude !== null && (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90))
      || (parsedLongitude !== null && (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180))
    ) {
      setError(t("memoryDetail.coordinatesError"));
      return;
    }
    onSave({
      caption: caption.trim(),
      takenAt,
      location: location.trim(),
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    });
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (!isSaving && event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="memory-photo-dialog-backdrop" onClick={handleBackdropClick}>
      <form className="memory-photo-dialog" role="dialog" aria-modal="true" aria-labelledby="memory-photo-edit-dialog-title" onSubmit={handleSubmit}>
        <header><h2 id="memory-photo-edit-dialog-title">{t("memoryDetail.editDialogTitle")}</h2><button type="button" onClick={onClose} aria-label={t("memoryDetail.closePhoto")}><X aria-hidden="true" /></button></header>
        <label><span>{t("memoryDetail.captionLabel")}</span><textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder={t("memoryDetail.captionPlaceholder")} /></label>
        <label><span>{t("memoryDetail.dateLabel")}</span><input type="datetime-local" required={photo.type === "primary"} value={takenAt} onChange={(event) => setTakenAt(event.target.value)} /></label>
        <label><span>{t("memoryDetail.locationLabel")}</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={t("memoryDetail.locationPlaceholder")} /></label>
        <div className="memory-photo-dialog-coordinates"><label><span>{t("memoryDetail.latitudeLabel")}</span><input type="number" step="0.000001" value={latitude} onChange={(event) => setLatitude(event.target.value)} /></label><label><span>{t("memoryDetail.longitudeLabel")}</span><input type="number" step="0.000001" value={longitude} onChange={(event) => setLongitude(event.target.value)} /></label></div>
        <small>{t("memoryDetail.coordinatesHint")}</small>
        {error ? <p>{error}</p> : null}
        <footer><button type="button" onClick={onClose} disabled={isSaving}>{t("memoryDetail.cancel")}</button><button type="submit" disabled={isSaving}>{isSaving ? t("memoryDetail.savingPhoto") : t("memoryDetail.savePhoto")}</button></footer>
      </form>
    </div>
  );
}
