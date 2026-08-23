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
import { BottomNavigation } from "./BottomNavigation";
import { FloatingHearts } from "./FloatingHearts";
import { MemoryFormModal, type NewMemoryDraft } from "./MemoryFormModal";
import {
  memoryCategories,
  memoryEntries,
  memoryViewModes,
  type MemoryCategoryId,
  type MemoryEntry,
  type MemoryViewMode,
} from "../data/memoriesContent";
import { navItems, type AppView } from "../data/homeContent";
import { useI18n } from "../i18n/I18nContext";
import { formatDateTime, type Language } from "../i18n/translations";

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
const initialCalendarDateKey =
  memoryEntries[0]?.dateTime.slice(0, 10) ?? getDateKey(new Date());

export function MemoriesPage({ activeView, onNavigate }: MemoriesPageProps) {
  const { language, t } = useI18n();
  const [memories, setMemories] = useState<MemoryEntry[]>(() => memoryEntries);
  const [activeMode, setActiveMode] = useState<MemoryViewMode>("timeline");
  const [activeCategory, setActiveCategory] = useState<MemoryCategoryId>("all");
  const [query, setQuery] = useState("");
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [selectedCalendarRange, setSelectedCalendarRange] =
    useState<CalendarRange | null>({
      start: initialCalendarDateKey,
      end: initialCalendarDateKey,
    });
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(() =>
    startOfMonth(parseDateKey(initialCalendarDateKey)),
  );

  const filteredMemories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return memories.filter((memory) => {
      const matchesCategory =
        activeCategory === "all" || memory.categoryId === activeCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [memory.title, memory.caption, memory.location].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, memories, query]);

  const memoriesByDate = useMemo(() => {
    return filteredMemories.reduce<Map<string, MemoryEntry[]>>(
      (groupedMemories, memory) => {
        const dateKey = memory.dateTime.slice(0, 10);
        const dateMemories = groupedMemories.get(dateKey) ?? [];

        groupedMemories.set(dateKey, [...dateMemories, memory]);
        return groupedMemories;
      },
      new Map(),
    );
  }, [filteredMemories]);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleCalendarMonth, memoriesByDate),
    [memoriesByDate, visibleCalendarMonth],
  );

  const calendarYears = useMemo(
    () => buildCalendarYears(memories, visibleCalendarMonth),
    [memories, visibleCalendarMonth],
  );

  const calendarMemories = selectedCalendarRange
    ? filteredMemories.filter((memory) =>
        isDateKeyInRange(
          memory.dateTime.slice(0, 10),
          selectedCalendarRange.start,
          selectedCalendarRange.end ?? selectedCalendarRange.start,
        ),
      )
    : filteredMemories;

  function handleSaveMemory(draft: NewMemoryDraft) {
    const category = memoryCategories.find(
      (item) => item.id === draft.categoryId,
    );

    if (editingMemory) {
      if (
        editingMemory.image.src.startsWith("blob:") &&
        editingMemory.image.src !== draft.image.src
      ) {
        URL.revokeObjectURL(editingMemory.image.src);
      }

      setMemories((currentMemories) =>
        currentMemories.map((memory) =>
          memory.id === editingMemory.id
            ? {
                ...memory,
                ...draft,
                categoryLabelKey:
                  category?.labelKey ?? "memories.categories.travel",
              }
            : memory,
        ),
      );
      setSelectedCalendarRange({
        start: draft.dateTime.slice(0, 10),
        end: draft.dateTime.slice(0, 10),
      });
      setVisibleCalendarMonth(startOfMonth(parseDateKey(draft.dateTime)));
      setEditingMemory(null);
      return;
    }

    setMemories((currentMemories) => [
      {
        id: `memory-${Date.now()}`,
        ...draft,
        categoryLabelKey: category?.labelKey ?? "memories.categories.travel",
        isFavorite: false,
      },
      ...currentMemories,
    ]);
    setSelectedCalendarRange({
      start: draft.dateTime.slice(0, 10),
      end: draft.dateTime.slice(0, 10),
    });
    setVisibleCalendarMonth(startOfMonth(parseDateKey(draft.dateTime)));
  }

  function handleCloseMemoryModal() {
    setIsMemoryModalOpen(false);
    setEditingMemory(null);
  }

  function handleCreateMemory() {
    setOpenActionMenuId(null);
    setEditingMemory(null);
    setIsMemoryModalOpen(true);
  }

  function handleEditMemory(memory: MemoryEntry) {
    setOpenActionMenuId(null);
    setEditingMemory(memory);
    setIsMemoryModalOpen(true);
  }

  function handleDeleteMemory(memoryId: string) {
    setOpenActionMenuId(null);
    const memoryToDelete = memories.find((memory) => memory.id === memoryId);

    if (memoryToDelete?.image.src.startsWith("blob:")) {
      URL.revokeObjectURL(memoryToDelete.image.src);
    }

    setMemories((currentMemories) =>
      currentMemories.filter((memory) => memory.id !== memoryId),
    );
  }

  function handleToggleFavorite(memoryId: string) {
    setOpenActionMenuId(null);
    setMemories((currentMemories) =>
      currentMemories.map((memory) =>
        memory.id === memoryId
          ? { ...memory, isFavorite: !memory.isFavorite }
          : memory,
      ),
    );
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

          <img
            className='memory-entry-image'
            src={memory.image.src || timelineFallbackImageSrc}
            alt={memory.image.alt}
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
                <p>{t("memories.momentCount", memories.length)}</p>
              </div>

              <button
                className='memories-add-button'
                type='button'
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

            {filteredMemories.length > 0 && activeMode === "grid" ? (
              <div
                className='memories-grid'
                aria-label={t("memories.grid.ariaLabel")}
              >
                {filteredMemories.map((memory) => {
                  const categoryName = t(memory.categoryLabelKey);
                  const hasPrimaryImage = memory.image.src.trim().length > 0;

                  return (
                    <article className='memory-grid-card' key={memory.id}>
                      <div className='memory-grid-visual'>
                        {hasPrimaryImage ? (
                          <img src={memory.image.src} alt={memory.image.alt} />
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
            ) : filteredMemories.length > 0 && activeMode === "calendar" ? (
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
            ) : filteredMemories.length > 0 ? (
              <div
                className='memories-timeline'
                aria-label={t("memories.timeline.ariaLabel")}
              >
                {filteredMemories.map((memory) => renderTimelineMemory(memory))}
              </div>
            ) : (
              <p className='memories-empty'>{t("memories.empty")}</p>
            )}
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
        onClose={handleCloseMemoryModal}
        onSave={handleSaveMemory}
      />
    </main>
  );
}

function formatGridDate(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateInput));
}

function formatLongDate(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDateKey(dateInput));
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
    parseDateKey(memory.dateTime).getFullYear(),
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

function parseDateKey(dateInput: string): Date {
  const [year, month, day] = dateInput.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDateKeyInRange(dateKey: string, startDateKey: string, endDateKey: string) {
  return dateKey >= startDateKey && dateKey <= endDateKey;
}
