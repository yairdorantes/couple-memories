import { ImagePlus, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  memoryCategories,
  type MemoryCategoryId,
  type MemoryEntry,
} from "../data/memoriesContent";
import { useI18n } from "../i18n/I18nContext";

type MemoryDraft = {
  title: string;
  caption: string;
  location: string;
  categoryId: Exclude<MemoryCategoryId, "all">;
  moodEmoji: string;
  dateTime: string;
  image: {
    src: string;
    alt: string;
  };
};

type MemoryFormModalProps = {
  isOpen: boolean;
  initialMemory?: MemoryEntry | null;
  onClose: () => void;
  onSave: (memory: MemoryDraft) => void;
};

const moodEmojis = ["❤️", "☕", "🌅", "🍿", "💐", "🚗", "🏖️"];

export function MemoryFormModal({
  isOpen,
  initialMemory,
  onClose,
  onSave,
}: MemoryFormModalProps) {
  const { t } = useI18n();
  const isEditing = Boolean(initialMemory);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] =
    useState<Exclude<MemoryCategoryId, "all">>("travel");
  const [moodEmoji, setMoodEmoji] = useState("❤️");
  const [dateTime, setDateTime] = useState(() =>
    getDateTimeInputValue(new Date()),
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialMemory) {
      setTitle(initialMemory.title);
      setCaption(initialMemory.caption);
      setLocation(initialMemory.location);
      setCategoryId(initialMemory.categoryId);
      setMoodEmoji(initialMemory.moodEmoji);
      setDateTime(initialMemory.dateTime);
      setPhotoPreview(initialMemory.image.src);
      setPhotoName("");
      setSelectedPhotoUrl(null);
      return;
    }

    setTitle("");
    setCaption("");
    setLocation("");
    setCategoryId("travel");
    setMoodEmoji("❤️");
    setDateTime(getDateTimeInputValue(new Date()));
    setPhotoPreview(null);
    setPhotoName("");
    setSelectedPhotoUrl(null);
  }, [initialMemory, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (selectedPhotoUrl) {
      URL.revokeObjectURL(selectedPhotoUrl);
    }

    setPhotoPreview(null);
    setPhotoName("");
    setSelectedPhotoUrl(null);
    onClose();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (selectedPhotoUrl) {
      URL.revokeObjectURL(selectedPhotoUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setPhotoPreview(objectUrl);
    setSelectedPhotoUrl(objectUrl);
    setPhotoName(file.name);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedCaption = caption.trim();
    const trimmedLocation = location.trim();

    onSave({
      title: trimmedTitle || "Nuevo recuerdo",
      caption: trimmedCaption || "Un momento para guardar.",
      location: trimmedLocation || "Lugar especial",
      categoryId,
      moodEmoji,
      dateTime,
      image: {
        src: photoPreview ?? "",
        alt: trimmedTitle || "Memory photo",
      },
    });

    setTitle("");
    setCaption("");
    setLocation("");
    setCategoryId("travel");
    setMoodEmoji("❤️");
    setPhotoPreview(null);
    setPhotoName("");
    setSelectedPhotoUrl(null);
    onClose();
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

        <div className='memory-modal-photo-field'>
          <span>{t("memoryForm.photoLabel")}</span>
          <label className='memory-modal-photo-picker'>
            <input type='file' accept='image/*' onChange={handlePhotoChange} />
            {photoPreview ? (
              <img src={photoPreview} alt={photoName} />
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
          <button type='button' onClick={handleClose}>
            {t("memoryForm.cancel")}
          </button>
          <button type='submit'>
            {t(isEditing ? "memoryForm.update" : "memoryForm.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

export type NewMemoryDraft = Parameters<MemoryFormModalProps["onSave"]>[0];

function getDateTimeInputValue(date: Date): string {
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return offsetDate.toISOString().slice(0, 16);
}
