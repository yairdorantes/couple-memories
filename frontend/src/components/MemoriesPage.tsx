import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Heart,
  Image as ImageIcon,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getMemoryImageCropKey, toMemoryEntry } from "../api/adapters";
import { useDefaultCouple, useMemories, useMemoryMutations } from "../api/hooks";
import { useDebouncedValue, getFriendlyError } from "../api/utils";
import type { MemoryDraftPayload } from "../api/types";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import { MemoryFormModal, type NewMemoryDraft } from "./MemoryFormModal";
import { PositionedImage } from "./PositionedImage";
import {
  memoryCategories,
  memoryViewModes,
  type MemoryCategoryId,
  type MemoryEntry,
  type MemoryViewMode,
} from "../data/memoriesContent";
import { navItems, type AppView } from "../data/homeContent";
import { useI18n } from "../i18n/I18nContext";
import { formatDateTime, type Language } from "../i18n/translations";
import { useToast } from "./ui/toastContext";
import { saveStoredImageCrop } from "../utils/imageCrop";
import {
  getDateForDisplay,
  getLocalDateKey,
  parseLocalDateKey,
  toIsoStringFromLocalInput,
} from "../utils/dateTime";

type MemoriesPageProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
};

type CalendarRange = {
  start: string;
  end: string | null;
};

const viewIcons: Record<MemoryViewMode, typeof TrendingUp> = {
  timeline: TrendingUp,
  grid: Grid2X2,
  calendar: CalendarDays,
};

const timelineFallbackImageSrc = "/images/featured-memory-placeholder.svg";
const initialCalendarDateKey = getDateKey(new Date());

export function MemoriesPage({ activeView, onNavigate }: MemoriesPageProps) {
  const { language, t } = useI18n();
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<MemoryViewMode>("timeline");
  const [activeCategory, setActiveCategory] = useState<MemoryCategoryId>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [modalError, setModalError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCalendarRange, setSelectedCalendarRange] =
    useState<CalendarRange | null>({
      start: initialCalendarDateKey,
      end: initialCalendarDateKey,
    });
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(() =>
    startOfMonth(parseLocalDateKey(initialCalendarDateKey)),
  );
  const coupleQuery = useDefaultCouple();
  const memoriesQuery = useMemories({
    category: activeCategory,
    search: debouncedQuery,
  });
  const memoryMutations = useMemoryMutations();

  const memories = useMemo(
    () =>
      memoriesQuery.data?.pages.flatMap((page) =>
        page.results.map((memory) => toMemoryEntry(memory)),
      ) ?? [],
    [memoriesQuery.data],
  );
  const memoryCount = memoriesQuery.data?.pages[0]?.count ?? memories.length;
  const isSavingMemory =
    memoryMutations.createMemory.isPending ||
    memoryMutations.updateMemory.isPending ||
    memoryMutations.uploadMedia.isPending;

  const memoriesByDate = useMemo(() => {
    return memories.reduce<Map<string, MemoryEntry[]>>(
      (groupedMemories, memory) => {
        const dateKey = getLocalDateKey(memory.dateTime);
        const dateMemories = groupedMemories.get(dateKey) ?? [];

        groupedMemories.set(dateKey, [...dateMemories, memory]);
        return groupedMemories;
      },
      new Map(),
    );
  }, [memories]);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleCalendarMonth, memoriesByDate),
    [memoriesByDate, visibleCalendarMonth],
  );

  const calendarYears = useMemo(
    () => buildCalendarYears(memories, visibleCalendarMonth),
    [memories, visibleCalendarMonth],
  );

  const calendarMemories = selectedCalendarRange
    ? memories.filter((memory) =>
        isDateKeyInRange(
          getLocalDateKey(memory.dateTime),
          selectedCalendarRange.start,
          selectedCalendarRange.end ?? selectedCalendarRange.start,
        ),
      )
    : memories;

  async function handleSaveMemory(draft: NewMemoryDraft) {
    if (!coupleQuery.data) {
      setModalError("The couple profile is still loading. Try again in a moment.");
      return;
    }

    try {
      setModalError("");
      setUploadProgress(0);
      const uploadedMedia = draft.photoFile
        ? await memoryMutations.uploadMedia.mutateAsync({
            file: draft.photoFile,
            onProgress: setUploadProgress,
          })
        : undefined;

      const payload: MemoryDraftPayload = {
        couple: coupleQuery.data.id,
        title: draft.title,
        caption: draft.caption,
        location_name: draft.location,
        latitude: draft.latitude,
        longitude: draft.longitude,
        mood_emoji: draft.moodEmoji,
        category: draft.categoryId,
        happened_at: toIsoStringFromLocalInput(draft.dateTime),
        primary_media: uploadedMedia?.id,
      };

      if (editingMemory) {
        await memoryMutations.updateMemory.mutateAsync({
          id: editingMemory.id,
          payload,
        });
        saveStoredImageCrop(getMemoryImageCropKey(editingMemory.id), draft.image.crop);
        showToast("Memory updated", "success");
      } else {
        const createdMemory = await memoryMutations.createMemory.mutateAsync(payload);
        saveStoredImageCrop(getMemoryImageCropKey(createdMemory.id), draft.image.crop);
        showToast("Memory created", "success");
      }

      setSelectedCalendarRange({
        start: getLocalDateKey(draft.dateTime),
        end: getLocalDateKey(draft.dateTime),
      });
      setVisibleCalendarMonth(startOfMonth(parseLocalDateKey(draft.dateTime)));
      setEditingMemory(null);
      setIsMemoryModalOpen(false);
      setUploadProgress(0);
    } catch (error) {
      setModalError(getFriendlyError(error));
      showToast("Could not save memory", "error");
    }
  }

  function handleCloseMemoryModal() {
    setIsMemoryModalOpen(false);
    setEditingMemory(null);
    setModalError("");
    setUploadProgress(0);
  }

  function handleCreateMemory() {
    setOpenActionMenuId(null);
    setEditingMemory(null);
    setModalError("");
    setIsMemoryModalOpen(true);
  }

  function handleEditMemory(memory: MemoryEntry) {
    setOpenActionMenuId(null);
    setEditingMemory(memory);
    setModalError("");
    setIsMemoryModalOpen(true);
  }

  async function handleDeleteMemory(memoryId: string) {
    setOpenActionMenuId(null);
    const shouldDelete = window.confirm("Delete this memory?");
    if (!shouldDelete) {
      return;
    }

    try {
      await memoryMutations.deleteMemory.mutateAsync(memoryId);
      showToast("Memory deleted", "success");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  async function handleToggleFavorite(memoryId: string) {
    setOpenActionMenuId(null);
    const memory = memories.find((item) => item.id === memoryId);
    if (!memory) {
      return;
    }

    try {
      await memoryMutations.updateMemory.mutateAsync({
        id: memoryId,
        payload: { is_favorite: !memory.isFavorite },
      });
      showToast(memory.isFavorite ? "Removed from favorites" : "Marked favorite", "success");
    } catch (error) {
      showToast(getFriendlyError(error), "error");
    }
  }

  function handleCalendarMonthChange(monthOffset: number) {
    setOpenActionMenuId(null);
    setVisibleCalendarMonth((currentMonth) =>
      addMonths(currentMonth, monthOffset),
    );
  }

  function handleCalendarMonthJump(monthIndex: number) {
    setOpenActionMenuId(null);
    setVisibleCalendarMonth(
      (currentMonth) => new Date(currentMonth.getFullYear(), monthIndex, 1),
    );
  }

  function handleCalendarYearJump(year: number) {
    setOpenActionMenuId(null);
    setVisibleCalendarMonth(
      (currentMonth) => new Date(year, currentMonth.getMonth(), 1),
    );
  }

  function handleCalendarDayClick(dateKey: string) {
    setOpenActionMenuId(null);

    if (!selectedCalendarRange || selectedCalendarRange.end) {
      setSelectedCalendarRange({ start: dateKey, end: null });
      return;
    }

    setSelectedCalendarRange(
      dateKey < selectedCalendarRange.start
        ? { start: dateKey, end: selectedCalendarRange.start }
        : { start: selectedCalendarRange.start, end: dateKey },
    );
  }

  function renderTimelineMemory(memory: MemoryEntry) {
    return (
      <article className='memory-entry' key={memory.id}>
        <div className='memory-entry-rail'>
          <div className='memory-entry-marker' aria-hidden='true' />
        </div>
        <div className='memory-entry-card'>
          <span className='memory-entry-emoji' aria-hidden='true'>
            {memory.moodEmoji}
          </span>
          <div className='memory-entry-top'>
            <div className='memory-entry-title'>
              <div>
                <h2>{memory.title}</h2>
                <time dateTime={memory.dateTime}>
                  {formatDateTime(memory.dateTime, language)}
                </time>
              </div>
            </div>

            <div className='memory-entry-actions'>
              {renderMemoryActionMenu(memory, "timeline")}
            </div>
          </div>

          <PositionedImage
            className='memory-entry-image'
            src={memory.image.src || timelineFallbackImageSrc}
            alt={memory.image.alt}
            crop={memory.image.crop}
          />
          <p className='memory-entry-caption'>{memory.caption}</p>
          <div className='memory-entry-footer'>
            <span className='memory-entry-tag'>
              {t(memory.categoryLabelKey)}
            </span>
            <span className='memory-entry-location'>
              <MapPin className='h-4 w-4' aria-hidden='true' />
              {memory.location}
            </span>
          </div>
        </div>
      </article>
    );
  }

  function renderMemoryActionMenu(
    memory: MemoryEntry,
    variant: MemoryViewMode,
  ) {
    const menuId = `memory-actions-${variant}-${memory.id}`;
    const isOpen = openActionMenuId === menuId;

    return (
      <div
        className={
          variant === "grid"
            ? "memory-action-menu-wrapper memory-action-menu-wrapper--grid"
            : "memory-action-menu-wrapper"
        }
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpenActionMenuId(null);
          }
        }}
      >
        <button
          className='memory-action-menu-trigger'
          type='button'
          aria-label={t("memories.actions.menu")}
          aria-haspopup='menu'
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() =>
            setOpenActionMenuId((currentMenuId) =>
              currentMenuId === menuId ? null : menuId,
            )
          }
        >
          <MoreHorizontal aria-hidden='true' />
        </button>

        {isOpen ? (
          <div
            className={
              variant === "grid"
                ? "memory-action-menu memory-action-menu--grid"
                : "memory-action-menu"
            }
            id={menuId}
            role='menu'
          >
            <button
              type='button'
              role='menuitem'
              aria-label={t("memories.actions.favorite")}
              onClick={() => handleToggleFavorite(memory.id)}
            >
              <Heart
                className={memory.isFavorite ? "is-favorite" : undefined}
                aria-hidden='true'
              />
              <span>{t("memories.actions.favorite")}</span>
            </button>
            <button
              type='button'
              role='menuitem'
              aria-label={t("memories.actions.edit")}
              onClick={() => handleEditMemory(memory)}
            >
              <Pencil aria-hidden='true' />
              <span>{t("memories.actions.edit")}</span>
            </button>
            <button
              className='is-danger'
              type='button'
              role='menuitem'
              aria-label={t("memories.actions.delete")}
              onClick={() => handleDeleteMemory(memory.id)}
            >
              <Trash2 aria-hidden='true' />
              <span>{t("memories.actions.delete")}</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className='min-h-screen overflow-x-hidden bg-ink-950 text-white'>
      <FloatingHearts />
      <div className='screen-glow' aria-hidden='true' />
      <div className='memories-shell'>
        <div className='mx-auto w-full space-y-4'>
          {/* <div className='flex justify-end'>
            <LanguageSwitcher />
          </div> */}

          <section className='memories-panel'>
            <header className='memories-header'>
              <div className='min-w-0'>
                <h1>{t("memories.title")}</h1>
                <p>{t("memories.momentCount", memoryCount)}</p>
              </div>

              <button
                className='memories-add-button'
                type='button'
                disabled={coupleQuery.isLoading || isSavingMemory}
                onClick={handleCreateMemory}
              >
                <Plus className='h-4 w-4' aria-hidden='true' />
                <span>{t("memories.addMemory")}</span>
              </button>
            </header>

            <div
              className='memories-tabs'
              role='tablist'
              aria-label={t("memories.tabs.ariaLabel")}
            >
              {memoryViewModes.map((mode) => {
                const Icon = viewIcons[mode.id];
                const isActive = activeMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    className={isActive ? "is-active" : undefined}
                    type='button'
                    role='tab'
                    aria-selected={isActive}
                    onClick={() => setActiveMode(mode.id)}
                  >
                    <Icon className='h-4 w-4' aria-hidden='true' />
                    <span>{t(mode.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            <label className='memories-search'>
              <span className='sr-only'>{t("memories.searchLabel")}</span>
              <Search className='h-5 w-5' aria-hidden='true' />
              <input
                type='search'
                value={query}
                placeholder={t("memories.searchPlaceholder")}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div
              className='memories-category-strip'
              role='list'
              aria-label={t("memories.categories.ariaLabel")}
            >
              {memoryCategories.map((category) => (
                <button
                  key={category.id}
                  className={
                    activeCategory === category.id ? "is-active" : undefined
                  }
                  type='button'
                  role='listitem'
                  onClick={() => setActiveCategory(category.id)}
                >
                  {t(category.labelKey)}
                </button>
              ))}
            </div>

            {memoriesQuery.isLoading ? (
              <div className='memories-loading' aria-live='polite'>
                <span />
                <span />
                <span />
              </div>
            ) : memoriesQuery.isError ? (
              <p className='memories-empty'>{getFriendlyError(memoriesQuery.error)}</p>
            ) : memories.length > 0 && activeMode === "grid" ? (
              <div
                className='memories-grid'
                aria-label={t("memories.grid.ariaLabel")}
              >
                {memories.map((memory) => {
                  const categoryName = t(memory.categoryLabelKey);
                  const hasPrimaryImage = memory.image.src.trim().length > 0;

                  return (
                    <article className='memory-grid-card' key={memory.id}>
                      <div className='memory-grid-visual'>
                        {hasPrimaryImage ? (
                          <PositionedImage
                            src={memory.image.src}
                            alt={memory.image.alt}
                            crop={memory.image.crop}
                          />
                        ) : (
                          <div className='memory-grid-fallback'>
                            <span aria-hidden='true'>{memory.moodEmoji}</span>
                            <p>
                              <ImageIcon
                                className='h-4 w-4'
                                aria-hidden='true'
                              />
                              {t("memories.grid.fallbackLabel", categoryName)}
                            </p>
                          </div>
                        )}

                        {renderMemoryActionMenu(memory, "grid")}
                      </div>

                      <div className='memory-grid-copy'>
                        <h2>{memory.title}</h2>
                        <p>{memory.caption}</p>
                        <div className='memory-grid-meta'>
                          <time dateTime={memory.dateTime}>
                            {formatGridDate(memory.dateTime, language)}
                          </time>
                          <span aria-hidden='true'>{memory.moodEmoji}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : memories.length > 0 && activeMode === "calendar" ? (
              <div className='memories-calendar-view'>
                <section
                  className='memories-calendar-card'
                  aria-label={t("memories.calendar.ariaLabel")}
                >
                  <header className='memories-calendar-header'>
                    <button
                      type='button'
                      aria-label={t("memories.calendar.previousMonth")}
                      onClick={() => handleCalendarMonthChange(-1)}
                    >
                      <ChevronLeft aria-hidden='true' />
                    </button>
                    <h2>{formatMonthTitle(visibleCalendarMonth, language)}</h2>
                    <button
                      type='button'
                      aria-label={t("memories.calendar.nextMonth")}
                      onClick={() => handleCalendarMonthChange(1)}
                    >
                      <ChevronRight aria-hidden='true' />
                    </button>
                  </header>

                  <div className='memories-calendar-jump'>
                    <label>
                      <span>{t("memories.calendar.monthLabel")}</span>
                      <select
                        value={visibleCalendarMonth.getMonth()}
                        onChange={(event) =>
                          handleCalendarMonthJump(Number(event.target.value))
                        }
                      >
                        {getMonthLabels(language).map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>{t("memories.calendar.yearLabel")}</span>
                      <select
                        value={visibleCalendarMonth.getFullYear()}
                        onChange={(event) =>
                          handleCalendarYearJump(Number(event.target.value))
                        }
                      >
                        {calendarYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div
                    className='memories-calendar-weekdays'
                    aria-hidden='true'
                  >
                    {getWeekdayLabels(language).map((weekday) => (
                      <span key={weekday}>{weekday}</span>
                    ))}
                  </div>

                  <div className='memories-calendar-grid'>
                    {calendarDays.map((day) => {
                      const isRangeStart =
                        selectedCalendarRange?.start === day.dateKey;
                      const isRangeEnd =
                        selectedCalendarRange?.end === day.dateKey;
                      const isInRange = selectedCalendarRange
                        ? isDateKeyInRange(
                            day.dateKey,
                            selectedCalendarRange.start,
                            selectedCalendarRange.end ??
                              selectedCalendarRange.start,
                          )
                        : false;
                      const isSelected = isRangeStart || isRangeEnd;

                      return (
                        <button
                          key={day.dateKey}
                          className={[
                            day.isCurrentMonth ? "" : "is-muted",
                            day.eventCount > 0 ? "has-memory" : "",
                            isSelected ? "is-selected" : "",
                            isRangeStart ? "is-range-start" : "",
                            isRangeEnd ? "is-range-end" : "",
                            isInRange ? "is-in-range" : "",
                            isRangeStart && !selectedCalendarRange?.end
                              ? "is-range-pending"
                              : "",
                            day.isToday ? "is-today" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          type='button'
                          aria-pressed={isSelected}
                          onClick={() => handleCalendarDayClick(day.dateKey)}
                        >
                          <span>{day.date.getDate()}</span>
                          {day.eventCount > 0 ? (
                            <i aria-hidden='true'>{day.eventCount}</i>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className='memories-calendar-selection'>
                  <h2>
                    {selectedCalendarRange
                      ? selectedCalendarRange.end &&
                        selectedCalendarRange.end !== selectedCalendarRange.start
                        ? t(
                            "memories.calendar.selectedRange",
                            formatLongDate(selectedCalendarRange.start, language),
                            formatLongDate(selectedCalendarRange.end, language),
                          )
                        : t(
                            "memories.calendar.selectedDate",
                            formatLongDate(selectedCalendarRange.start, language),
                          )
                      : t("memories.calendar.allMemories")}
                  </h2>
                  {selectedCalendarRange ? (
                    <button
                      type='button'
                      onClick={() => {
                        setOpenActionMenuId(null);
                        setSelectedCalendarRange(null);
                      }}
                    >
                      {t("memories.calendar.showAll")}
                    </button>
                  ) : null}
                </div>

                {calendarMemories.length > 0 ? (
                  <div
                    className='memories-timeline memories-timeline--calendar'
                    aria-label={t("memories.timeline.ariaLabel")}
                  >
                    {calendarMemories.map((memory) =>
                      renderTimelineMemory(memory),
                    )}
                  </div>
                ) : (
                  <p className='memories-empty'>{t("memories.empty")}</p>
                )}
              </div>
            ) : memories.length > 0 ? (
              <div
                className='memories-timeline'
                aria-label={t("memories.timeline.ariaLabel")}
              >
                {memories.map((memory) => renderTimelineMemory(memory))}
              </div>
            ) : (
              <p className='memories-empty'>{t("memories.empty")}</p>
            )}
            {memoriesQuery.hasNextPage ? (
              <button
                className='memories-load-more'
                type='button'
                disabled={memoriesQuery.isFetchingNextPage}
                onClick={() => memoriesQuery.fetchNextPage()}
              >
                {memoriesQuery.isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            ) : null}
          </section>
        </div>
      </div>
      <BottomNavigation
        activeView={activeView}
        items={navItems}
        onNavigate={onNavigate}
      />
      <MemoryFormModal
        isOpen={isMemoryModalOpen}
        initialMemory={editingMemory}
        errorMessage={modalError}
        isSaving={isSavingMemory}
        onClose={handleCloseMemoryModal}
        onSave={handleSaveMemory}
        uploadProgress={uploadProgress}
      />
    </main>
  );
}

function formatGridDate(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(getDateForDisplay(dateInput));
}

function formatLongDate(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseLocalDateKey(dateInput));
}

function formatMonthTitle(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getWeekdayLabels(language: Language): string[] {
  const sunday = new Date(2026, 7, 16);

  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(language, { weekday: "narrow" }).format(
      addDays(sunday, index),
    ),
  );
}

function getMonthLabels(language: Language): string[] {
  return Array.from({ length: 12 }, (_, monthIndex) =>
    new Intl.DateTimeFormat(language, { month: "long" }).format(
      new Date(2026, monthIndex, 1),
    ),
  );
}

function buildCalendarDays(
  visibleMonth: Date,
  memoriesByDate: Map<string, MemoryEntry[]>,
) {
  const firstDayOfMonth = startOfMonth(visibleMonth);
  const firstVisibleDay = addDays(firstDayOfMonth, -firstDayOfMonth.getDay());
  const todayKey = getDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisibleDay, index);
    const dateKey = getDateKey(date);

    return {
      date,
      dateKey,
      eventCount: memoriesByDate.get(dateKey)?.length ?? 0,
      isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      isToday: dateKey === todayKey,
    };
  });
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarYears(memories: MemoryEntry[], visibleMonth: Date): number[] {
  const memoryYears = memories.map((memory) =>
    getDateForDisplay(memory.dateTime).getFullYear(),
  );
  const currentYear = new Date().getFullYear();
  const visibleYear = visibleMonth.getFullYear();
  const minYear = Math.min(currentYear, visibleYear, ...memoryYears) - 2;
  const maxYear = Math.max(currentYear, visibleYear, ...memoryYears) + 2;

  return Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => minYear + index,
  );
}

function addMonths(date: Date, monthOffset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
}

function addDays(date: Date, dayOffset: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + dayOffset,
  );
}

function getDateKey(date: Date): string {
  return getLocalDateKey(date);
}

function isDateKeyInRange(dateKey: string, startDateKey: string, endDateKey: string) {
  return dateKey >= startDateKey && dateKey <= endDateKey;
}
