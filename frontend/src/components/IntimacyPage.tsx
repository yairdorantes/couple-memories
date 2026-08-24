import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toIntimacyEntry } from "../api/adapters";
import { useDefaultCouple, useIntimacyMutations, useIntimacyRecords } from "../api/hooks";
import { getFriendlyError } from "../api/utils";
import type { IntimacyDraftPayload } from "../api/types";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import { navItems, type AppView } from "../data/homeContent";
import {
  intimacyMoods,
  type IntimacyDraft,
  type IntimacyEntry,
  type IntimacyMoodId,
} from "../data/intimacyContent";
import { useI18n } from "../i18n/I18nContext";
import { formatDateTime, formatShortDate, type Language } from "../i18n/translations";
import { useToast } from "./ui/toastContext";
import type { TranslationKey } from "../i18n/translations";
import {
  getLocalDateKey,
  toIsoStringFromLocalInput,
  toLocalDateTimeInputValue,
} from "../utils/dateTime";

type IntimacyPageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
};

type IntimacyFilter = "all" | "month" | "favorites";

const filterLabelKeys: Record<IntimacyFilter, TranslationKey> = {
  all: "intimacy.filter.all",
  month: "intimacy.filter.month",
  favorites: "intimacy.filter.favorites",
};

export function IntimacyPage({ activeView, onNavigate }: IntimacyPageProps) {
  const { language, t } = useI18n();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<IntimacyFilter>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [editingEntry, setEditingEntry] = useState<IntimacyEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [primaryCountMode, setPrimaryCountMode] = useState<"month" | "all">("month");
  const coupleQuery = useDefaultCouple();
  const recordsQuery = useIntimacyRecords();
  const intimacyMutations = useIntimacyMutations();
  const isSaving =
    intimacyMutations.createRecord.isPending ||
    intimacyMutations.updateRecord.isPending ||
    intimacyMutations.deleteRecord.isPending;
  const isLoading = coupleQuery.isLoading || recordsQuery.isLoading;
  const loadError = coupleQuery.isError
    ? getFriendlyError(coupleQuery.error)
    : recordsQuery.isError
      ? getFriendlyError(recordsQuery.error)
      : "";
  const entries = useMemo(
    () => recordsQuery.data?.results.map((record) => toIntimacyEntry(record)) ?? [],
    [recordsQuery.data],
  );

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (firstEntry, secondEntry) =>
          new Date(secondEntry.happenedAt).getTime() -
          new Date(firstEntry.happenedAt).getTime(),
      ),
    [entries],
  );

  const stats = useMemo(() => getIntimacyStats(entries), [entries]);
  const calendarDays = useMemo(
    () => buildCalendarDays(entries, visibleCalendarMonth),
    [entries, visibleCalendarMonth],
  );
  const calendarYears = useMemo(
    () => buildCalendarYears(entries, visibleCalendarMonth),
    [entries, visibleCalendarMonth],
  );

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      if (selectedDate && getLocalDateKey(entry.happenedAt) !== selectedDate) {
        return false;
      }

      if (filter === "month") {
        return isSameMonth(new Date(entry.happenedAt), new Date());
      }

      if (filter === "favorites") {
        return entry.isFavorite;
      }

      return true;
    });
  }, [filter, selectedDate, sortedEntries]);

  function handleOpenCreate() {
    setEditingEntry(null);
    setOpenMenuId(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(entry: IntimacyEntry) {
    setEditingEntry(entry);
    setOpenMenuId(null);
    setIsModalOpen(true);
  }

  async function handleSaveEntry(draft: IntimacyDraft) {
    if (!coupleQuery.data) {
      showToast(t("intimacy.error"), "error");
      return;
    }

    const payload: IntimacyDraftPayload = {
      couple: coupleQuery.data.id,
      title: draft.title,
      happened_at: toIsoStringFromLocalInput(draft.happenedAt),
      place: draft.place,
      mood: draft.mood,
      note: draft.note,
      is_favorite: draft.isFavorite,
    };

    try {
      if (editingEntry) {
        await intimacyMutations.updateRecord.mutateAsync({
          id: editingEntry.id,
          payload,
        });
        showToast(t("intimacy.feedback.updated"), "success");
      } else {
        await intimacyMutations.createRecord.mutateAsync(payload);
        showToast(t("intimacy.feedback.created"), "success");
      }

      setVisibleCalendarMonth(startOfMonth(new Date(draft.happenedAt)));
      setEditingEntry(null);
      setIsModalOpen(false);
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  async function handleDeleteEntry(entryId: string) {
    setOpenMenuId(null);
    const shouldDelete = window.confirm("Delete this private moment?");
    if (!shouldDelete) {
      return;
    }

    try {
      await intimacyMutations.deleteRecord.mutateAsync(entryId);
      showToast(t("intimacy.feedback.deleted"), "success");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  async function handleToggleFavorite(entry: IntimacyEntry) {
    setOpenMenuId(null);
    try {
      await intimacyMutations.updateRecord.mutateAsync({
        id: entry.id,
        payload: { is_favorite: !entry.isFavorite },
      });
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  function handleCalendarMonthChange(monthOffset: number) {
    setOpenMenuId(null);
    setVisibleCalendarMonth((currentMonth) => addMonths(currentMonth, monthOffset));
  }

  function handleCalendarMonthJump(monthIndex: number) {
    setOpenMenuId(null);
    setVisibleCalendarMonth(
      (currentMonth) => new Date(currentMonth.getFullYear(), monthIndex, 1),
    );
  }

  function handleCalendarYearJump(year: number) {
    setOpenMenuId(null);
    setVisibleCalendarMonth(
      (currentMonth) => new Date(year, currentMonth.getMonth(), 1),
    );
  }

  return (
    <main className='min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <FloatingHearts />
      <div className='screen-glow' aria-hidden='true' />
      <div className='intimacy-shell'>
        <section className='intimacy-panel'>
          <header className='intimacy-header'>
            <div>
              <span>{t("intimacy.eyebrow")}</span>
              <h1>{t("intimacy.title")}</h1>
              <p>{t("intimacy.subtitle", stats.thisMonth)}</p>
            </div>
            <button
              className='intimacy-add-button'
              type='button'
              aria-label={t("intimacy.add")}
              disabled={coupleQuery.isLoading || isSaving}
              onClick={handleOpenCreate}
            >
              <Plus aria-hidden='true' />
            </button>
          </header>

          {isLoading ? (
            <div className='intimacy-loading' aria-label={t("intimacy.loading")}>
              <span />
              <span />
              <span />
            </div>
          ) : null}

          {loadError ? (
            <div className='intimacy-state-card is-error'>
              <ShieldCheck aria-hidden='true' />
              <p>{loadError}</p>
            </div>
          ) : null}

          {!isLoading ? (
            <>
              <section className='intimacy-stats-grid' aria-label={t("intimacy.statsLabel")}>
                <IntimacyStat
                  icon={<Heart aria-hidden='true' />}
                  label={t(primaryCountMode === "month" ? "intimacy.thisMonth" : "intimacy.allTime")}
                  value={String(primaryCountMode === "month" ? stats.thisMonth : stats.allTime)}
                  actionLabel={t("intimacy.toggleCount")}
                  isPressed={primaryCountMode === "all"}
                  onClick={() =>
                    setPrimaryCountMode((currentMode) =>
                      currentMode === "month" ? "all" : "month",
                    )
                  }
                />
                <IntimacyStat icon={<Flame aria-hidden='true' />} label={t("intimacy.streak")} value={t("intimacy.weeks", stats.streakWeeks)} />
                <IntimacyStat icon={<CalendarDays aria-hidden='true' />} label={t("intimacy.average")} value={stats.weeklyAverage.toFixed(1)} />
              </section>

              <section className='intimacy-calendar-card'>
                <header className='intimacy-calendar-header'>
                  <button
                    type='button'
                    aria-label={t("intimacy.calendar.previousMonth")}
                    onClick={() => handleCalendarMonthChange(-1)}
                  >
                    <ChevronLeft aria-hidden='true' />
                  </button>
                  <div>
                    <span>{t("intimacy.calendarEyebrow")}</span>
                    <h2>{formatMonthLabel(visibleCalendarMonth, language)}</h2>
                  </div>
                  <button
                    type='button'
                    aria-label={t("intimacy.calendar.nextMonth")}
                    onClick={() => handleCalendarMonthChange(1)}
                  >
                    <ChevronRight aria-hidden='true' />
                  </button>
                </header>

                <div className='intimacy-calendar-jump'>
                  <label>
                    <span>{t("intimacy.calendar.monthLabel")}</span>
                    <select
                      value={visibleCalendarMonth.getMonth()}
                      onChange={(event) => handleCalendarMonthJump(Number(event.target.value))}
                    >
                      {getMonthLabels(language).map((month, index) => (
                        <option key={month} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{t("intimacy.calendar.yearLabel")}</span>
                    <select
                      value={visibleCalendarMonth.getFullYear()}
                      onChange={(event) => handleCalendarYearJump(Number(event.target.value))}
                    >
                      {calendarYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedDate ? (
                    <button className='intimacy-calendar-clear' type='button' onClick={() => setSelectedDate(null)}>
                      {t("intimacy.clearDate")}
                    </button>
                  ) : null}
                </div>
                <div className='intimacy-calendar-grid'>
                  {getWeekdayLabels(language).map((weekday, index) => (
                    <span key={`${weekday}-${index}`} className='intimacy-calendar-weekday'>
                      {weekday}
                    </span>
                  ))}
                  {calendarDays.map((day) => (
                    <button
                      key={day.key}
                      className={[
                        "intimacy-calendar-day",
                        day.isCurrentMonth ? "" : "is-muted",
                        day.count > 0 ? "has-entry" : "",
                        selectedDate === day.key ? "is-selected" : "",
                      ].join(" ")}
                      type='button'
                      onClick={() => setSelectedDate(day.count > 0 ? day.key : null)}
                    >
                      <span>{day.date.getDate()}</span>
                      {day.count > 0 ? <i>{day.count}</i> : null}
                    </button>
                  ))}
                </div>
              </section>

              <div className='intimacy-filter-row' role='group' aria-label={t("intimacy.filtersLabel")}>
                {(["month", "all", "favorites"] as const).map((filterId) => (
                  <button
                    key={filterId}
                    className={filter === filterId ? "is-active" : undefined}
                    type='button'
                    onClick={() => setFilter(filterId)}
                  >
                    {t(filterLabelKeys[filterId])}
                  </button>
                ))}
              </div>

              <section className='intimacy-timeline' aria-label={t("intimacy.timelineLabel")}>
                <div className='intimacy-section-heading'>
                  <div>
                    <span>{t("intimacy.timelineEyebrow")}</span>
                    <h2>{selectedDate ? formatShortDate(selectedDate, language) : t("intimacy.timelineTitle")}</h2>
                  </div>
                </div>

                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <IntimacyEntryCard
                      key={entry.id}
                      entry={entry}
                      language={language}
                      isMenuOpen={openMenuId === entry.id}
                      onEdit={() => handleOpenEdit(entry)}
                      onDelete={() => handleDeleteEntry(entry.id)}
                      onToggleFavorite={() => handleToggleFavorite(entry)}
                      onToggleMenu={() =>
                        setOpenMenuId((currentId) => currentId === entry.id ? null : entry.id)
                      }
                    />
                  ))
                ) : (
                  <div className='intimacy-state-card'>
                    <Heart aria-hidden='true' />
                    <p>{t("intimacy.empty")}</p>
                    <button type='button' onClick={handleOpenCreate}>
                      {t("intimacy.addFirst")}
                    </button>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </section>
      </div>

      <IntimacyFormModal
        entry={editingEntry}
        isOpen={isModalOpen}
        onClose={() => {
          setEditingEntry(null);
          setIsModalOpen(false);
        }}
        onSave={handleSaveEntry}
        isSaving={isSaving}
      />

      <BottomNavigation
        activeView={activeView}
        items={navItems}
        onNavigate={onNavigate}
      />
    </main>
  );
}

type IntimacyStatProps = {
  icon: ReactNode;
  label: string;
  value: string;
  actionLabel?: string;
  isPressed?: boolean;
  onClick?: () => void;
};

function IntimacyStat({
  icon,
  label,
  value,
  actionLabel,
  isPressed,
  onClick,
}: IntimacyStatProps) {
  const content = (
    <>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (onClick) {
    return (
      <button
        className='intimacy-stat-card intimacy-stat-card--button'
        type='button'
        aria-label={actionLabel ?? label}
        aria-pressed={isPressed}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <article className='intimacy-stat-card'>
      {content}
    </article>
  );
}

type IntimacyEntryCardProps = {
  entry: IntimacyEntry;
  language: Language;
  isMenuOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleMenu: () => void;
};

function IntimacyEntryCard({
  entry,
  language,
  isMenuOpen,
  onDelete,
  onEdit,
  onToggleFavorite,
  onToggleMenu,
}: IntimacyEntryCardProps) {
  const { t } = useI18n();
  const mood = getMood(entry.mood);

  return (
    <article className={`intimacy-entry-card${isMenuOpen ? " is-menu-open" : ""}`}>
      <div className='intimacy-entry-icon'>{mood.icon}</div>
      <div className='intimacy-entry-body'>
        <div className='intimacy-entry-top'>
          <div>
            <h3>{entry.title}</h3>
            <p>{formatDateTime(entry.happenedAt, language)} · {entry.place}</p>
          </div>
          <div className='intimacy-entry-menu' onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              onToggleMenu();
            }
          }}>
            <button type='button' aria-label={t("intimacy.actions.menu")} onClick={onToggleMenu}>
              <MoreHorizontal aria-hidden='true' />
            </button>
            {isMenuOpen ? (
              <div>
                <button type='button' onClick={onToggleFavorite}>
                  <Heart aria-hidden='true' />
                  {entry.isFavorite ? t("intimacy.actions.unfavorite") : t("intimacy.actions.favorite")}
                </button>
                <button type='button' onClick={onEdit}>
                  <Pencil aria-hidden='true' />
                  {t("intimacy.actions.edit")}
                </button>
                <button type='button' onClick={onDelete}>
                  <Trash2 aria-hidden='true' />
                  {t("intimacy.actions.delete")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <p>{entry.note}</p>
        <div className='intimacy-entry-meta'>
          <span>{mood.label}</span>
          {entry.isFavorite ? <span>{t("intimacy.favorite")}</span> : null}
        </div>
      </div>
    </article>
  );
}

type IntimacyFormModalProps = {
  entry: IntimacyEntry | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (draft: IntimacyDraft) => void;
};

function IntimacyFormModal({ entry, isOpen, isSaving, onClose, onSave }: IntimacyFormModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [happenedAt, setHappenedAt] = useState(() => getDateTimeInputValue(new Date()));
  const [place, setPlace] = useState("");
  const [mood, setMood] = useState<IntimacyMoodId>("tender");
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(entry?.title ?? "");
    setHappenedAt(entry?.happenedAt ?? getDateTimeInputValue(new Date()));
    setPlace(entry?.place ?? "");
    setMood(entry?.mood ?? "tender");
    setNote(entry?.note ?? "");
    setIsFavorite(entry?.isFavorite ?? false);
  }, [entry, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      title: title.trim() || t("intimacy.form.defaultTitle"),
      happenedAt,
      place: place.trim() || t("intimacy.form.defaultPlace"),
      mood,
      note: note.trim() || t("intimacy.form.defaultNote"),
      isFavorite,
    });
  }

  return (
    <div className='memory-modal-backdrop' role='presentation'>
      <form
        className='intimacy-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='intimacy-modal-title'
        onSubmit={handleSubmit}
      >
        <div className='memory-modal-header'>
          <h2 id='intimacy-modal-title'>
            {t(entry ? "intimacy.form.editTitle" : "intimacy.form.title")}
          </h2>
          <button className='memory-modal-close' type='button' aria-label={t("intimacy.form.cancel")} disabled={isSaving} onClick={onClose}>
            <X aria-hidden='true' />
          </button>
        </div>

        <label className='memory-modal-field'>
          <span>{t("intimacy.form.titleLabel")}</span>
          <input value={title} placeholder={t("intimacy.form.titlePlaceholder")} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label className='memory-modal-field'>
          <span>{t("intimacy.form.dateLabel")}</span>
          <input type='datetime-local' value={happenedAt} onChange={(event) => setHappenedAt(event.target.value)} />
        </label>

        <label className='memory-modal-field'>
          <span>{t("intimacy.form.placeLabel")}</span>
          <input value={place} placeholder={t("intimacy.form.placePlaceholder")} onChange={(event) => setPlace(event.target.value)} />
        </label>

        <fieldset className='memory-modal-options'>
          <legend>{t("intimacy.form.moodLabel")}</legend>
          <div className='intimacy-mood-row'>
            {intimacyMoods.map((moodOption) => (
              <button
                key={moodOption.id}
                className={mood === moodOption.id ? "is-active" : undefined}
                type='button'
                onClick={() => setMood(moodOption.id)}
              >
                <span>{moodOption.icon}</span>
                {moodOption.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className='memory-modal-field'>
          <span>{t("intimacy.form.noteLabel")}</span>
          <textarea value={note} maxLength={160} placeholder={t("intimacy.form.notePlaceholder")} onChange={(event) => setNote(event.target.value)} />
        </label>

        <label className='intimacy-favorite-toggle'>
          <input type='checkbox' checked={isFavorite} onChange={(event) => setIsFavorite(event.target.checked)} />
          <span>
            <Check aria-hidden='true' />
            {t("intimacy.form.favoriteLabel")}
          </span>
        </label>

        <div className='memory-modal-actions'>
          <button type='button' disabled={isSaving} onClick={onClose}>
            {t("intimacy.form.cancel")}
          </button>
          <button type='submit' disabled={isSaving}>
            {isSaving ? "Saving..." : t(entry ? "intimacy.form.update" : "intimacy.form.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function getMood(moodId: IntimacyMoodId) {
  return intimacyMoods.find((mood) => mood.id === moodId) ?? intimacyMoods[0];
}

function getIntimacyStats(entries: IntimacyEntry[]) {
  const now = new Date();
  const thisMonth = entries.filter((entry) => isSameMonth(new Date(entry.happenedAt), now)).length;
  const currentMonthDates = entries
    .filter((entry) => isSameMonth(new Date(entry.happenedAt), now))
    .map((entry) => new Date(entry.happenedAt).getDate());

  const activeWeeks = new Set(
    entries.map((entry) => getWeekKey(new Date(entry.happenedAt))),
  );

  return {
    allTime: entries.length,
    thisMonth,
    streakWeeks: getWeekStreak(activeWeeks),
    weeklyAverage: thisMonth / Math.max(1, Math.ceil(now.getDate() / 7)),
    currentMonthDates,
  };
}

function buildCalendarDays(entries: IntimacyEntry[], visibleMonth: Date) {
  const firstDay = startOfMonth(visibleMonth);
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  const counts = entries.reduce<Record<string, number>>((accumulator, entry) => {
    const key = getLocalDateKey(entry.happenedAt);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const key = getDateKey(date);

    return {
      date,
      key,
      count: counts[key] ?? 0,
      isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
    };
  });
}

function buildCalendarYears(entries: IntimacyEntry[], visibleMonth: Date): number[] {
  const entryYears = entries.map((entry) => new Date(entry.happenedAt).getFullYear());
  const currentYear = new Date().getFullYear();
  const visibleYear = visibleMonth.getFullYear();
  const minYear = Math.min(currentYear, visibleYear, ...entryYears) - 2;
  const maxYear = Math.max(currentYear, visibleYear, ...entryYears) + 2;

  return Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => minYear + index,
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, monthOffset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
}

function isSameMonth(date: Date, referenceDate: Date) {
  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

function getWeekStreak(activeWeeks: Set<string>) {
  let streak = 0;
  const cursor = new Date();

  while (activeWeeks.has(getWeekKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

function getWeekKey(date: Date) {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return getDateKey(weekStart);
}

function getDateKey(date: Date) {
  return getLocalDateKey(date);
}

function getDateTimeInputValue(date: Date): string {
  return toLocalDateTimeInputValue(date);
}

function formatMonthLabel(date: Date, language: Language) {
  return new Intl.DateTimeFormat(language, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getWeekdayLabels(language: Language): string[] {
  const sunday = new Date(2026, 7, 16);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return new Intl.DateTimeFormat(language, { weekday: "narrow" }).format(date);
  });
}

function getMonthLabels(language: Language): string[] {
  return Array.from({ length: 12 }, (_, monthIndex) =>
    new Intl.DateTimeFormat(language, { month: "long" }).format(
      new Date(2026, monthIndex, 1),
    ),
  );
}
