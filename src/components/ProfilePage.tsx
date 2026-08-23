import {
  Camera,
  Check,
  HeartHandshake,
  MessageCircleHeart,
  Palette,
  Pencil,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import {
  defaultProfile,
  type CoupleProfile,
  type ProfilePerson,
  type ProfileRole,
} from "../data/profileContent";
import { navItems, type AppView } from "../data/homeContent";
import { useI18n } from "../i18n/I18nContext";
import type { Language } from "../i18n/translations";

type ProfilePageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
};

const profileStorageKey = "couple-memories-profile";

export function ProfilePage({ activeView, onNavigate }: ProfilePageProps) {
  const { language, t } = useI18n();
  const [profile, setProfile] = useState<CoupleProfile>(() => readStoredProfile());
  const [editingRole, setEditingRole] = useState<ProfileRole | null>(null);
  const [editingNoteRole, setEditingNoteRole] = useState<ProfileRole | null>(
    null,
  );
  const [draftPerson, setDraftPerson] = useState<ProfilePerson | null>(null);
  const [draftNote, setDraftNote] = useState("");

  const coupleNames = useMemo(
    () => `${profile.people.her.name} & ${profile.people.him.name}`,
    [profile.people.her.name, profile.people.him.name],
  );

  useEffect(() => {
    writeStoredProfile(profile);
  }, [profile]);

  function handleStartEdit(role: ProfileRole) {
    setEditingRole(role);
    setDraftPerson(profile.people[role]);
  }

  function handleCancelEdit() {
    setEditingRole(null);
    setDraftPerson(null);
  }

  function handleSavePerson() {
    if (!draftPerson || !editingRole) {
      return;
    }

    setProfile((currentProfile) => ({
      ...currentProfile,
      people: {
        ...currentProfile.people,
        [editingRole]: draftPerson,
      },
    }));
    setEditingRole(null);
    setDraftPerson(null);
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

  function handleSaveNote(role: ProfileRole) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      people: {
        ...currentProfile.people,
        [role]: {
          ...currentProfile.people[role],
          statusNote: draftNote.trim().slice(0, 80),
        },
      },
    }));
    setEditingNoteRole(null);
    setDraftNote("");
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
              <h1>{t("profile.title")}</h1>
              <p>{t("profile.subtitle", coupleNames)}</p>
            </div>
            <HeartHandshake aria-hidden='true' />
          </header>

          <div className='profile-couple-card'>
            {(["her", "him"] as const).map((role) => (
              <PersonProfileCard
                key={role}
                person={profile.people[role]}
                role={role}
                isEditing={editingRole === role}
                draftPerson={editingRole === role ? draftPerson : null}
                onAvatarChange={handleAvatarChange}
                onCancel={handleCancelEdit}
                onDraftChange={handleDraftChange}
                onEdit={() => handleStartEdit(role)}
                onCancelNoteEdit={handleCancelNoteEdit}
                onDraftNoteChange={setDraftNote}
                onEditNote={() => handleStartNoteEdit(role)}
                onSave={handleSavePerson}
                onSaveNote={() => handleSaveNote(role)}
                isNoteEditing={editingNoteRole === role}
                language={language}
                draftNote={editingNoteRole === role ? draftNote : ""}
              />
            ))}
          </div>
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

type PersonProfileCardProps = {
  person: ProfilePerson;
  role: ProfileRole;
  isEditing: boolean;
  draftPerson: ProfilePerson | null;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onDraftChange: <Key extends keyof ProfilePerson>(
    key: Key,
    value: ProfilePerson[Key],
  ) => void;
  onCancelNoteEdit: () => void;
  onDraftNoteChange: (value: string) => void;
  onEdit: () => void;
  onEditNote: () => void;
  onSave: () => void;
  onSaveNote: () => void;
  isNoteEditing: boolean;
  language: Language;
  draftNote: string;
};

function PersonProfileCard({
  person,
  role,
  isEditing,
  draftPerson,
  onAvatarChange,
  onCancel,
  onDraftChange,
  onCancelNoteEdit,
  onDraftNoteChange,
  onEdit,
  onEditNote,
  onSave,
  onSaveNote,
  isNoteEditing,
  language,
  draftNote,
}: PersonProfileCardProps) {
  const { t } = useI18n();
  const visiblePerson = draftPerson ?? person;
  const roleLabel = role === "her" ? t("profile.her") : t("profile.him");

  return (
    <article
      className={`profile-person-card profile-person-card--${role}`}
      style={
        { "--profile-accent": visiblePerson.accentColor } as React.CSSProperties
      }
    >
      <div className='profile-person-top'>
        <span className='profile-role-badge'>{roleLabel}</span>
        {isEditing ? (
          <div className='profile-edit-actions'>
            <button type='button' aria-label={t("profile.cancel")} onClick={onCancel}>
              <X aria-hidden='true' />
            </button>
            <button type='button' aria-label={t("profile.save")} onClick={onSave}>
              <Check aria-hidden='true' />
            </button>
          </div>
        ) : (
          <button className='profile-edit-button' type='button' onClick={onEdit}>
            <Pencil aria-hidden='true' />
            <span>{t("profile.edit")}</span>
          </button>
        )}
      </div>

      <div className='profile-avatar-block'>
        <div className='profile-avatar-ring'>
          <img src={visiblePerson.avatarSrc} alt={t(visiblePerson.avatarAltKey)} />
        </div>
        {isEditing ? (
          <label className='profile-avatar-picker'>
            <Camera aria-hidden='true' />
            <span>{t("profile.avatar.change")}</span>
            <input type='file' accept='image/*' onChange={onAvatarChange} />
          </label>
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
              onChange={(event) => onDraftChange("birthday", event.target.value)}
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
              onChange={(event) => onDraftChange("accentColor", event.target.value)}
            />
          </label>
          <label className='profile-field'>
            <span>{t("profile.description")}</span>
            <textarea
              value={draftPerson.description}
              onChange={(event) => onDraftChange("description", event.target.value)}
            />
          </label>
        </div>
      ) : (
        <div className='profile-person-copy'>
          <h2>{person.name}</h2>
          <p>{person.description}</p>
          <section className='profile-note-card'>
            <img src={person.avatarSrc} alt={t(person.avatarAltKey)} />
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
                    <button type='button' onClick={onCancelNoteEdit}>
                      {t("profile.cancel")}
                    </button>
                    <button type='button' onClick={onSaveNote}>
                      {t("profile.save")}
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

function readStoredProfile(): CoupleProfile {
  try {
    const storedProfile = window.localStorage.getItem(profileStorageKey);

    if (!storedProfile) {
      return defaultProfile;
    }

    const parsedProfile = JSON.parse(storedProfile) as Partial<CoupleProfile>;

    return {
      ...defaultProfile,
      ...parsedProfile,
      people: {
        her: {
          ...defaultProfile.people.her,
          ...parsedProfile.people?.her,
        },
        him: {
          ...defaultProfile.people.him,
          ...parsedProfile.people?.him,
        },
      },
    };
  } catch {
    return defaultProfile;
  }
}

function writeStoredProfile(profile: CoupleProfile) {
  try {
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  } catch {
    // Local persistence can fail in private browsing or low-storage states.
  }
}

function formatProfileDate(dateInput: string, language: Language): string {
  if (!dateInput) {
    return "";
  }

  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateInput));
}
