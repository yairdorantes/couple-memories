import {
  Camera,
  Check,
  HeartHandshake,
  ImagePlus,
  MessageCircleHeart,
  Palette,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getProfileAvatarCropKey,
  getProfileMembers,
  toProfilePerson,
} from "../api/adapters";
import {
  useCoupleHeroImages,
  useDefaultCouple,
  useProfileMutations,
} from "../api/hooks";
import { getFriendlyError } from "../api/utils";
import type { ApiCoupleHeroImage } from "../api/types";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import { ImageCropControls } from "./ImageCropControls";
import { PositionedImage } from "./PositionedImage";
import {
  defaultProfile,
  type CoupleProfile,
  type ProfilePerson,
  type ProfileRole,
} from "../data/profileContent";
import { navItems, type AppView } from "../data/homeContent";
import { useCurrentPerson } from "../identity/useCurrentPerson";
import { useI18n } from "../i18n/I18nContext";
import type { Language } from "../i18n/translations";
import { useToast } from "./ui/toastContext";
import {
  defaultImageCrop,
  saveStoredImageCrop,
  type ImageCrop,
} from "../utils/imageCrop";
import { getDateForDisplay } from "../utils/dateTime";
import { LanguageSwitcher } from "./LanguageSwitcher";

type ProfilePageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
};

export function ProfilePage({ activeView, onNavigate }: ProfilePageProps) {
  const { language, t } = useI18n();
  const { currentPersonRole, setCurrentPersonRole } = useCurrentPerson();
  const { showToast } = useToast();
  const coupleQuery = useDefaultCouple();
  const heroImagesQuery = useCoupleHeroImages(coupleQuery.data?.id);
  const profileMutations = useProfileMutations();
  const [editingRole, setEditingRole] = useState<ProfileRole | null>(null);
  const [editingNoteRole, setEditingNoteRole] = useState<ProfileRole | null>(
    null,
  );
  const [draftPerson, setDraftPerson] = useState<ProfilePerson | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftAvatarFile, setDraftAvatarFile] = useState<File | undefined>();
  const [selectedHeroImageId, setSelectedHeroImageId] = useState<string | null>(
    null,
  );
  const [heroCropDrafts, setHeroCropDrafts] = useState<Record<string, ImageCrop>>(
    {},
  );
  const [isAddingHeroImages, setIsAddingHeroImages] = useState(false);

  const apiMembers = getProfileMembers(coupleQuery.data);
  const profile: CoupleProfile = {
    people: apiMembers
      ? {
          her: toProfilePerson(apiMembers.her),
          him: toProfilePerson(apiMembers.him),
        }
      : defaultProfile.people,
  };
  const coupleNames = useMemo(
    () => `${profile.people.her.name} & ${profile.people.him.name}`,
    [profile.people.her.name, profile.people.him.name],
  );
  const isSavingProfile =
    profileMutations.updateMember.isPending ||
    profileMutations.uploadMedia.isPending;
  const heroImages = useMemo(
    () => heroImagesQuery.data ?? [],
    [heroImagesQuery.data],
  );

  useEffect(() => {
    if (selectedHeroImageId || !heroImages[0]) {
      return;
    }

    setSelectedHeroImageId(String(heroImages[0].id));
  }, [heroImages, selectedHeroImageId]);

  function handleStartEdit(role: ProfileRole) {
    setEditingRole(role);
    setDraftPerson(profile.people[role]);
    setDraftAvatarFile(undefined);
  }

  function handleCancelEdit() {
    setEditingRole(null);
    setDraftPerson(null);
    setDraftAvatarFile(undefined);
  }

  async function handleSavePerson() {
    if (!draftPerson || !editingRole) {
      return;
    }

    const member = apiMembers?.[editingRole];
    if (!member) {
      showToast("Profile is still syncing. Try again.", "error");
      return;
    }

    try {
      const uploadedAvatar = draftAvatarFile
        ? await profileMutations.uploadMedia.mutateAsync({
            file: draftAvatarFile,
          })
        : undefined;

      await profileMutations.updateMember.mutateAsync({
        id: member.id,
        payload: {
          name: draftPerson.name,
          birthday: draftPerson.birthday || null,
          accent_color: draftPerson.accentColor,
          description: draftPerson.description,
          avatar: uploadedAvatar?.id ?? member.avatar,
        },
      });
      saveStoredImageCrop(
        getProfileAvatarCropKey(editingRole),
        draftPerson.avatarCrop ?? defaultImageCrop,
      );
      showToast("Profile updated", "success");
      setEditingRole(null);
      setDraftPerson(null);
      setDraftAvatarFile(undefined);
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  function handleDraftChange<Key extends keyof ProfilePerson>(
    key: Key,
    value: ProfilePerson[Key],
  ) {
    setDraftPerson((currentDraft) =>
      currentDraft ? { ...currentDraft, [key]: value } : currentDraft,
    );
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        handleDraftChange("avatarSrc", reader.result);
      }
    });
    setDraftAvatarFile(file);
    reader.readAsDataURL(file);
  }

  function handleStartNoteEdit(role: ProfileRole) {
    setEditingNoteRole(role);
    setDraftNote(profile.people[role].statusNote);
  }

  function handleCancelNoteEdit() {
    setEditingNoteRole(null);
    setDraftNote("");
  }

  async function handleSaveNote(role: ProfileRole) {
    const member = apiMembers?.[role];
    if (!member) {
      showToast("Profile is still syncing. Try again.", "error");
      return;
    }

    try {
      await profileMutations.updateMember.mutateAsync({
        id: member.id,
        payload: { status_note: draftNote.trim().slice(0, 80) },
      });
      showToast("Note updated", "success");
      setEditingNoteRole(null);
      setDraftNote("");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  async function handleHeroImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    if (!coupleQuery.data?.id) {
      showToast("Profile is still syncing. Try again.", "error");
      return;
    }

    setIsAddingHeroImages(true);
    try {
      const coupleId = coupleQuery.data.id;
      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const media = await profileMutations.uploadMedia.mutateAsync({ file });
          return profileMutations.createHeroImage.mutateAsync({
            couple: coupleId,
            media: media.id,
            crop: defaultImageCrop,
            sort_order: index,
          });
        }),
      );
      setSelectedHeroImageId(
        uploadedImages[0] ? String(uploadedImages[0].id) : null,
      );
      showToast(t("profile.hero.saved"), "success");
    } catch (error) {
      showToast(getFriendlyError(error) || t("profile.hero.error"), "error");
    } finally {
      setIsAddingHeroImages(false);
    }
  }

  function handleHeroImageCropChange(imageId: string, crop: ImageCrop) {
    setHeroCropDrafts((currentDrafts) => ({
      ...currentDrafts,
      [imageId]: crop,
    }));
    profileMutations.updateHeroImage.mutate({
      id: Number(imageId),
      payload: { crop },
    });
  }

  function handleHeroImageRemove(imageId: string) {
    if (!coupleQuery.data?.id) {
      showToast("Profile is still syncing. Try again.", "error");
      return;
    }

    const nextSelectedImage = heroImages.find(
      (image) => String(image.id) !== imageId,
    );
    profileMutations.deleteHeroImage.mutate({
      id: Number(imageId),
      coupleId: coupleQuery.data.id,
    });
    setSelectedHeroImageId((currentId) =>
      currentId === imageId
        ? nextSelectedImage
          ? String(nextSelectedImage.id)
          : null
        : currentId,
    );
  }

  return (
    <main className='min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <FloatingHearts />
      <div className='screen-glow' aria-hidden='true' />
      <div className='profile-shell'>
        <section className='profile-panel'>
          <header className='profile-header'>
            <div>
              <span>{t("profile.eyebrow")}</span>
              <h1 className='w-1 h-2'>
                <HeartHandshake aria-hidden='true' />
              </h1>
              <p>{t("profile.subtitle", coupleNames)}</p>
            </div>
            <div className='profile-header-language'>
              <LanguageSwitcher />
            </div>
          </header>
          {coupleQuery.isLoading ? (
            <div className='profile-status-message'>Loading profile...</div>
          ) : null}
          {coupleQuery.isError ? (
            <div className='profile-status-message is-error'>
              {getFriendlyError(coupleQuery.error)}
            </div>
          ) : null}

          <div className='profile-couple-card'>
            {(["her", "him"] as const).map((role) => (
              <PersonProfileCard
                key={role}
                person={profile.people[role]}
                role={role}
                isCurrentPerson={currentPersonRole === role}
                isEditing={editingRole === role}
                draftPerson={editingRole === role ? draftPerson : null}
                onAvatarChange={handleAvatarChange}
                onCancel={handleCancelEdit}
                onDraftChange={handleDraftChange}
                onAvatarCropChange={(crop) =>
                  handleDraftChange("avatarCrop", crop)
                }
                onEdit={() => handleStartEdit(role)}
                onSelectCurrentPerson={() => setCurrentPersonRole(role)}
                onCancelNoteEdit={handleCancelNoteEdit}
                onDraftNoteChange={setDraftNote}
                onEditNote={() => handleStartNoteEdit(role)}
                onSave={handleSavePerson}
                onSaveNote={() => handleSaveNote(role)}
                isNoteEditing={editingNoteRole === role}
                isSaving={isSavingProfile}
                language={language}
                draftNote={editingNoteRole === role ? draftNote : ""}
              />
            ))}
          </div>
          <HeroImageManager
            images={heroImages}
            cropDrafts={heroCropDrafts}
            selectedImageId={selectedHeroImageId}
            isAdding={
              isAddingHeroImages ||
              profileMutations.uploadMedia.isPending ||
              profileMutations.createHeroImage.isPending
            }
            isLoading={heroImagesQuery.isLoading}
            onAddImages={handleHeroImageChange}
            onCropChange={handleHeroImageCropChange}
            onRemove={handleHeroImageRemove}
            onSelect={setSelectedHeroImageId}
          />
        </section>
      </div>
      <BottomNavigation
        activeView={activeView}
        items={navItems}
        onNavigate={onNavigate}
      />
    </main>
  );
}

type HeroImageManagerProps = {
  images: ApiCoupleHeroImage[];
  cropDrafts: Record<string, ImageCrop>;
  selectedImageId: string | null;
  isAdding: boolean;
  isLoading: boolean;
  onAddImages: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCropChange: (imageId: string, crop: ImageCrop) => void;
  onRemove: (imageId: string) => void;
  onSelect: (imageId: string) => void;
};

function HeroImageManager({
  images,
  cropDrafts,
  selectedImageId,
  isAdding,
  isLoading,
  onAddImages,
  onCropChange,
  onRemove,
  onSelect,
}: HeroImageManagerProps) {
  const { t } = useI18n();
  const selectedImage =
    images.find((image) => String(image.id) === selectedImageId) ?? images[0] ?? null;
  const selectedImageIdKey = selectedImage ? String(selectedImage.id) : "";
  const selectedImageCrop =
    (selectedImageIdKey && cropDrafts[selectedImageIdKey]) ||
    selectedImage?.crop ||
    defaultImageCrop;

  return (
    <section className='profile-hero-manager'>
      <div className='profile-hero-manager-header'>
        <div>
          <h2>{t("profile.hero.title")}</h2>
          <p>{t("profile.hero.subtitle")}</p>
        </div>
        <label className='profile-hero-add-button'>
          <ImagePlus aria-hidden='true' />
          <span>{isAdding ? t("profile.hero.saving") : t("profile.hero.add")}</span>
          <input
            type='file'
            accept='image/*'
            multiple
            disabled={isAdding}
            onChange={onAddImages}
          />
        </label>
      </div>

      {isLoading ? (
        <div className='profile-hero-empty'>{t("profile.hero.loading")}</div>
      ) : selectedImage ? (
        <div className='profile-hero-editor'>
          <PositionedImage
            className='profile-hero-preview'
            src={
              selectedImage.media_detail?.url ??
              selectedImage.media_detail?.optimized_url ??
              ""
            }
            alt={t("profile.hero.previewAlt")}
            crop={selectedImageCrop}
          />
          <ImageCropControls
            className='profile-hero-crop-controls'
            crop={selectedImageCrop}
            labels={{
              title: t("imageCrop.title"),
              x: t("imageCrop.x"),
              y: t("imageCrop.y"),
              zoom: t("imageCrop.zoom"),
              cover: t("imageCrop.cover"),
              contain: t("imageCrop.contain"),
              reset: t("imageCrop.reset"),
            }}
            onChange={(crop) => onCropChange(String(selectedImage.id), crop)}
          />
        </div>
      ) : (
        <div className='profile-hero-empty'>{t("profile.hero.empty")}</div>
      )}

      {images.length > 0 ? (
        <div className='profile-hero-thumbnails' aria-label={t("profile.hero.title")}>
          {images.map((image) => (
            <div
              key={image.id}
              className={`profile-hero-thumbnail${
                image.id === selectedImage?.id ? " is-selected" : ""
              }`}
            >
              <button type='button' onClick={() => onSelect(String(image.id))}>
                <PositionedImage
                  src={image.media_detail?.url ?? image.media_detail?.optimized_url ?? ""}
                  alt={t("profile.hero.previewAlt")}
                  crop={cropDrafts[String(image.id)] ?? image.crop}
                />
              </button>
              <button
                type='button'
                aria-label={t("profile.hero.remove")}
                onClick={() => onRemove(String(image.id))}
              >
                <Trash2 aria-hidden='true' />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

type PersonProfileCardProps = {
  person: ProfilePerson;
  role: ProfileRole;
  isCurrentPerson: boolean;
  isEditing: boolean;
  draftPerson: ProfilePerson | null;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onDraftChange: <Key extends keyof ProfilePerson>(
    key: Key,
    value: ProfilePerson[Key],
  ) => void;
  onAvatarCropChange: (crop: ImageCrop) => void;
  onCancelNoteEdit: () => void;
  onDraftNoteChange: (value: string) => void;
  onEdit: () => void;
  onSelectCurrentPerson: () => void;
  onEditNote: () => void;
  onSave: () => void;
  onSaveNote: () => void;
  isNoteEditing: boolean;
  isSaving: boolean;
  language: Language;
  draftNote: string;
};

function PersonProfileCard({
  person,
  role,
  isCurrentPerson,
  isEditing,
  draftPerson,
  onAvatarChange,
  onCancel,
  onDraftChange,
  onAvatarCropChange,
  onCancelNoteEdit,
  onDraftNoteChange,
  onEdit,
  onSelectCurrentPerson,
  onEditNote,
  onSave,
  onSaveNote,
  isNoteEditing,
  isSaving,
  language,
  draftNote,
}: PersonProfileCardProps) {
  const { t } = useI18n();
  const visiblePerson = draftPerson ?? person;
  const roleLabel = visiblePerson.name;

  return (
    <article
      className={`profile-person-card profile-person-card--${role}`}
      style={
        { "--profile-accent": visiblePerson.accentColor } as React.CSSProperties
      }
    >
      <div className='profile-person-top'>
        <button
          className={`profile-role-badge${isCurrentPerson ? " is-current" : ""}`}
          type='button'
          aria-pressed={isCurrentPerson}
          aria-label={
            isCurrentPerson
              ? t("profile.selectedPerson", roleLabel)
              : t("profile.useAsMe", roleLabel)
          }
          title={
            isCurrentPerson
              ? t("profile.selectedPerson", roleLabel)
              : t("profile.useAsMe", roleLabel)
          }
          onClick={onSelectCurrentPerson}
        >
          {roleLabel}
        </button>
        {isEditing ? (
          <div className='profile-edit-actions'>
            <button
              type='button'
              aria-label={t("profile.cancel")}
              onClick={onCancel}
            >
              <X aria-hidden='true' />
            </button>
            <button
              type='button'
              aria-label={t("profile.save")}
              disabled={isSaving}
              onClick={onSave}
            >
              <Check aria-hidden='true' />
            </button>
          </div>
        ) : (
          <button
            className='profile-edit-button'
            type='button'
            onClick={onEdit}
          >
            <Pencil aria-hidden='true' />
            <span>{t("profile.edit")}</span>
          </button>
        )}
      </div>

      <div className='profile-avatar-block'>
        <div className='profile-avatar-ring'>
          <PositionedImage
            src={visiblePerson.avatarSrc}
            alt={t(visiblePerson.avatarAltKey)}
            crop={visiblePerson.avatarCrop}
          />
        </div>
        {isEditing ? (
          <>
            <label className='profile-avatar-picker'>
              <Camera aria-hidden='true' />
              <span>{t("profile.avatar.change")}</span>
              <input type='file' accept='image/*' onChange={onAvatarChange} />
            </label>
            <ImageCropControls
              className='profile-avatar-crop-controls'
              crop={visiblePerson.avatarCrop ?? defaultImageCrop}
              labels={{
                title: t("imageCrop.title"),
                x: t("imageCrop.x"),
                y: t("imageCrop.y"),
                zoom: t("imageCrop.zoom"),
                cover: t("imageCrop.cover"),
                contain: t("imageCrop.contain"),
                reset: t("imageCrop.reset"),
              }}
              onChange={onAvatarCropChange}
            />
          </>
        ) : null}
      </div>

      {isEditing && draftPerson ? (
        <div className='profile-edit-form'>
          <label className='profile-field'>
            <span>{t("profile.name")}</span>
            <input
              type='text'
              value={draftPerson.name}
              onChange={(event) => onDraftChange("name", event.target.value)}
            />
          </label>
          <label className='profile-field'>
            <span>{t("profile.birthday")}</span>
            <input
              type='date'
              value={draftPerson.birthday}
              onChange={(event) =>
                onDraftChange("birthday", event.target.value)
              }
            />
          </label>
          <label className='profile-field'>
            <span>
              <Palette aria-hidden='true' />
              {t("profile.accentColor")}
            </span>
            <input
              type='color'
              value={draftPerson.accentColor}
              onChange={(event) =>
                onDraftChange("accentColor", event.target.value)
              }
            />
          </label>
          <label className='profile-field'>
            <span>{t("profile.description")}</span>
            <textarea
              value={draftPerson.description}
              onChange={(event) =>
                onDraftChange("description", event.target.value)
              }
            />
          </label>
        </div>
      ) : (
        <div className='profile-person-copy'>
          <h2>{person.name}</h2>
          <p>{person.description}</p>
          <section className='profile-note-card'>
            <PositionedImage
              src={person.avatarSrc}
              alt={t(person.avatarAltKey)}
              crop={person.avatarCrop}
            />
            <div className='profile-note-content'>
              <span>
                <MessageCircleHeart aria-hidden='true' />
                {roleLabel}
              </span>
              {isNoteEditing ? (
                <div className='profile-note-editor'>
                  <textarea
                    value={draftNote}
                    maxLength={80}
                    rows={2}
                    placeholder={t("profile.note.empty")}
                    onChange={(event) => onDraftNoteChange(event.target.value)}
                  />
                  <div>
                    <small>{draftNote.length}/80</small>
                    <button
                      type='button'
                      disabled={isSaving}
                      onClick={onCancelNoteEdit}
                    >
                      {t("profile.cancel")}
                    </button>
                    <button
                      type='button'
                      disabled={isSaving}
                      onClick={onSaveNote}
                    >
                      {isSaving ? "Saving..." : t("profile.save")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={
                    person.statusNote.trim()
                      ? "profile-note-bubble"
                      : "profile-note-bubble is-empty"
                  }
                  type='button'
                  onClick={onEditNote}
                >
                  {person.statusNote.trim() || t("profile.note.empty")}
                </button>
              )}
            </div>
          </section>
          <dl>
            <div>
              <dt>{t("profile.birthday")}</dt>
              <dd>{formatProfileDate(person.birthday, language)}</dd>
            </div>
          </dl>
        </div>
      )}
    </article>
  );
}

function formatProfileDate(dateInput: string, language: Language): string {
  if (!dateInput) {
    return "";
  }

  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
  }).format(getDateForDisplay(dateInput));
}
