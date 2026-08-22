export const supportedLanguages = ["en", "es"] as const;

export type Language = (typeof supportedLanguages)[number];

export type TranslationKey =
  | "app.title"
  | "hero.imageAlt"
  | "hero.avatarOneAlt"
  | "hero.avatarTwoAlt"
  | "hero.togetherLine"
  | "hero.anniversaryIn"
  | "counter.heading"
  | "counter.ariaSummary"
  | "counter.years"
  | "counter.months"
  | "counter.days"
  | "featured.ariaLabel"
  | "featured.badge"
  | "featured.title.cholula"
  | "featured.caption.cholula"
  | "featured.daysTogether"
  | "featured.viewMore"
  | "highlights.ariaLabel"
  | "highlights.memories.title"
  | "highlights.memories.caption"
  | "highlights.places.title"
  | "highlights.places.caption"
  | "highlights.letters.title"
  | "highlights.letters.caption"
  | "nav.ariaLabel"
  | "nav.home"
  | "nav.love"
  | "nav.places"
  | "nav.albums"
  | "nav.memories"
  | "nav.recap"
  | "nav.profile"
  | "memories.title"
  | "memories.momentCount"
  | "memories.addMemory"
  | "memories.tabs.ariaLabel"
  | "memories.tabs.timeline"
  | "memories.tabs.grid"
  | "memories.tabs.calendar"
  | "memories.grid.ariaLabel"
  | "memories.grid.fallbackLabel"
  | "memories.calendar.ariaLabel"
  | "memories.calendar.previousMonth"
  | "memories.calendar.nextMonth"
  | "memories.calendar.selectedDate"
  | "memories.calendar.allMemories"
  | "memories.calendar.showAll"
  | "memories.searchLabel"
  | "memories.searchPlaceholder"
  | "memories.categories.ariaLabel"
  | "memories.categories.all"
  | "memories.categories.movie"
  | "memories.categories.coffee"
  | "memories.categories.travel"
  | "memories.categories.food"
  | "memories.timeline.ariaLabel"
  | "memories.actions.menu"
  | "memories.actions.favorite"
  | "memories.actions.edit"
  | "memories.actions.delete"
  | "memories.empty"
  | "memoryForm.title"
  | "memoryForm.editTitle"
  | "memoryForm.titleLabel"
  | "memoryForm.titlePlaceholder"
  | "memoryForm.captionLabel"
  | "memoryForm.captionPlaceholder"
  | "memoryForm.locationLabel"
  | "memoryForm.locationPlaceholder"
  | "memoryForm.photoLabel"
  | "memoryForm.photoButton"
  | "memoryForm.photoSelected"
  | "memoryForm.dateLabel"
  | "memoryForm.categoryLabel"
  | "memoryForm.emojiLabel"
  | "memoryForm.cancel"
  | "memoryForm.save"
  | "memoryForm.update"
  | "actions.addMemory"
  | "language.label"
  | "language.english"
  | "language.spanish";

type TranslationArg = number | string;
type TranslationValue = string | ((...args: TranslationArg[]) => string);
type TranslationCatalog = Record<TranslationKey, TranslationValue>;

export const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
};

export const translations: Record<Language, TranslationCatalog> = {
  en: {
    "app.title": "Couple Memories",
    "hero.imageAlt": "A couple walking together on a beach at sunset",
    "hero.avatarOneAlt": "First partner avatar placeholder",
    "hero.avatarTwoAlt": "Second partner avatar placeholder",
    "hero.togetherLine": (days) => `${formatUnit("en", days, "day")} together`,
    "hero.anniversaryIn": (days) =>
      `Anniversary in ${formatUnit("en", days, "day")}`,
    "counter.heading": "Together for",
    "counter.ariaSummary": (years, months, days) =>
      `${formatUnit("en", years, "year")}, ${formatUnit("en", months, "month")}, and ${formatUnit("en", days, "day")}`,
    "counter.years": "Years",
    "counter.months": "Months",
    "counter.days": "Days",
    "featured.ariaLabel": "Featured memory",
    "featured.badge": "Featured",
    "featured.title.cholula": "Cholula, our first trip",
    "featured.caption.cholula": "The afternoon we kept walking after sunset",
    "featured.daysTogether": (days) =>
      `${formatUnit("en", days, "day")} together`,
    "featured.viewMore": "View more",
    "highlights.ariaLabel": "Relationship highlights",
    "highlights.memories.title": "Memories",
    "highlights.memories.caption": "favorite moments saved",
    "highlights.places.title": "Places",
    "highlights.places.caption": "shared stops and trips",
    "highlights.letters.title": "Letters",
    "highlights.letters.caption": "notes for quiet days",
    "nav.ariaLabel": "Primary",
    "nav.home": "Home",
    "nav.love": "Love",
    "nav.places": "Places",
    "nav.albums": "Albums",
    "nav.memories": "Memories",
    "nav.recap": "Recap",
    "nav.profile": "Profile",
    "memories.title": "Memories",
    "memories.momentCount": (count) =>
      `${count} moment${count === 1 ? "" : "s"} captured`,
    "memories.addMemory": "Memory",
    "memories.tabs.ariaLabel": "Memory views",
    "memories.tabs.timeline": "Timeline",
    "memories.tabs.grid": "Grid",
    "memories.tabs.calendar": "Calendar",
    "memories.grid.ariaLabel": "Memories grid",
    "memories.grid.fallbackLabel": (category) => `${category} Moment`,
    "memories.calendar.ariaLabel": "Memory calendar",
    "memories.calendar.previousMonth": "Previous month",
    "memories.calendar.nextMonth": "Next month",
    "memories.calendar.selectedDate": (date) => `Memories on ${date}`,
    "memories.calendar.allMemories": "All memories",
    "memories.calendar.showAll": "Show all",
    "memories.searchLabel": "Search memories",
    "memories.searchPlaceholder": "Search title, location, caption...",
    "memories.categories.ariaLabel": "Memory categories",
    "memories.categories.all": "All",
    "memories.categories.movie": "Movie",
    "memories.categories.coffee": "Coffee",
    "memories.categories.travel": "Travel",
    "memories.categories.food": "Food",
    "memories.timeline.ariaLabel": "Memories timeline",
    "memories.actions.menu": "Memory actions",
    "memories.actions.favorite": "Favorite memory",
    "memories.actions.edit": "Edit memory",
    "memories.actions.delete": "Delete memory",
    "memories.empty": "No memories match this search.",
    "memoryForm.title": "Save Memory",
    "memoryForm.editTitle": "Edit Memory",
    "memoryForm.titleLabel": "Title",
    "memoryForm.titlePlaceholder": "Title (e.g. Sunset Walk)",
    "memoryForm.captionLabel": "Caption",
    "memoryForm.captionPlaceholder": "Caption / Memory notes",
    "memoryForm.locationLabel": "Location",
    "memoryForm.locationPlaceholder": "Location (e.g. Cholula)",
    "memoryForm.photoLabel": "Main photo",
    "memoryForm.photoButton": "Choose photo",
    "memoryForm.photoSelected": "Photo selected",
    "memoryForm.dateLabel": "Memory date and time",
    "memoryForm.categoryLabel": "Category",
    "memoryForm.emojiLabel": "Mood emoji",
    "memoryForm.cancel": "Cancel",
    "memoryForm.save": "Save Memory",
    "memoryForm.update": "Update Memory",
    "actions.addMemory": "Add a memory",
    "language.label": "Language",
    "language.english": "EN",
    "language.spanish": "ES",
  },
  es: {
    "app.title": "Recuerdos",
    "hero.imageAlt": "Una pareja caminando junta en la playa al atardecer",
    "hero.avatarOneAlt": "Imagen provisional de la primera persona",
    "hero.avatarTwoAlt": "Imagen provisional de la segunda persona",
    "hero.togetherLine": (days) => `${formatUnit("es", days, "day")} juntos`,
    "hero.anniversaryIn": (days) =>
      `Aniversario en ${formatUnit("es", days, "day")}`,
    "counter.heading": "Juntos por",
    "counter.ariaSummary": (years, months, days) =>
      `${formatUnit("es", years, "year")}, ${formatUnit("es", months, "month")} y ${formatUnit("es", days, "day")}`,
    "counter.years": "Años",
    "counter.months": "Meses",
    "counter.days": "Días",
    "featured.ariaLabel": "Recuerdo destacado",
    "featured.badge": "Destacado",
    "featured.title.cholula": "Cholula, nuestro primer viaje",
    "featured.caption.cholula":
      "La tarde en que seguimos caminando después del atardecer",
    "featured.daysTogether": (days) =>
      `${formatUnit("es", days, "day")} juntos`,
    "featured.viewMore": "Ver más",
    "highlights.ariaLabel": "Momentos de la relación",
    "highlights.memories.title": "Recuerdos",
    "highlights.memories.caption": "momentos favoritos guardados",
    "highlights.places.title": "Lugares",
    "highlights.places.caption": "paradas y viajes compartidos",
    "highlights.letters.title": "Cartas",
    "highlights.letters.caption": "notas para días tranquilos",
    "nav.ariaLabel": "Principal",
    "nav.home": "Inicio",
    "nav.love": "Amor",
    "nav.places": "Lugares",
    "nav.albums": "Álbumes",
    "nav.memories": "Recuerdos",
    "nav.recap": "Resumen",
    "nav.profile": "Perfil",
    "memories.title": "Recuerdos",
    "memories.momentCount": (count) =>
      `${count} momento${count === 1 ? "" : "s"} capturado${count === 1 ? "" : "s"}`,
    "memories.addMemory": "Recuerdo",
    "memories.tabs.ariaLabel": "Vistas de recuerdos",
    "memories.tabs.timeline": "Timeline",
    "memories.tabs.grid": "Grid",
    "memories.tabs.calendar": "Calendario",
    "memories.grid.ariaLabel": "Grid de recuerdos",
    "memories.grid.fallbackLabel": (category) => `Recuerdo de ${category}`,
    "memories.calendar.ariaLabel": "Calendario de recuerdos",
    "memories.calendar.previousMonth": "Mes anterior",
    "memories.calendar.nextMonth": "Mes siguiente",
    "memories.calendar.selectedDate": (date) => `Recuerdos del ${date}`,
    "memories.calendar.allMemories": "Todos los recuerdos",
    "memories.calendar.showAll": "Ver todos",
    "memories.searchLabel": "Buscar recuerdos",
    "memories.searchPlaceholder": "Buscar titulo, lugar, caption...",
    "memories.categories.ariaLabel": "Categorias de recuerdos",
    "memories.categories.all": "Todos",
    "memories.categories.movie": "Cine",
    "memories.categories.coffee": "Cafe",
    "memories.categories.travel": "Viaje",
    "memories.categories.food": "Comida",
    "memories.timeline.ariaLabel": "Linea de tiempo de recuerdos",
    "memories.actions.menu": "Acciones del recuerdo",
    "memories.actions.favorite": "Marcar recuerdo favorito",
    "memories.actions.edit": "Editar recuerdo",
    "memories.actions.delete": "Eliminar recuerdo",
    "memories.empty": "No hay recuerdos con esa busqueda.",
    "memoryForm.title": "Guardar recuerdo",
    "memoryForm.editTitle": "Editar recuerdo",
    "memoryForm.titleLabel": "Titulo",
    "memoryForm.titlePlaceholder": "Titulo (ej. Caminata al atardecer)",
    "memoryForm.captionLabel": "Caption",
    "memoryForm.captionPlaceholder": "Caption / notas del recuerdo",
    "memoryForm.locationLabel": "Lugar",
    "memoryForm.locationPlaceholder": "Lugar (ej. Cholula)",
    "memoryForm.photoLabel": "Foto principal",
    "memoryForm.photoButton": "Elegir foto",
    "memoryForm.photoSelected": "Foto seleccionada",
    "memoryForm.dateLabel": "Fecha y hora del recuerdo",
    "memoryForm.categoryLabel": "Categoria",
    "memoryForm.emojiLabel": "Emoji",
    "memoryForm.cancel": "Cancelar",
    "memoryForm.save": "Guardar recuerdo",
    "memoryForm.update": "Actualizar recuerdo",
    "actions.addMemory": "Agregar un recuerdo",
    "language.label": "Idioma",
    "language.english": "EN",
    "language.spanish": "ES",
  },
};

const unitLabels = {
  en: {
    day: ["day", "days"],
    month: ["month", "months"],
    year: ["year", "years"],
  },
  es: {
    day: ["día", "días"],
    month: ["mes", "meses"],
    year: ["año", "años"],
  },
} satisfies Record<
  Language,
  Record<"day" | "month" | "year", [string, string]>
>;

export function isSupportedLanguage(value: string): value is Language {
  return supportedLanguages.includes(value as Language);
}

export function getDefaultLanguage(): Language {
  const storedLanguage = safelyReadStoredLanguage();

  if (storedLanguage && isSupportedLanguage(storedLanguage)) {
    return storedLanguage;
  }

  const browserLanguage = window.navigator.language.split("-")[0];
  return isSupportedLanguage(browserLanguage) ? browserLanguage : "en";
}

export function formatShortDate(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateInput));
}

export function formatDateTime(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateInput));
}

function formatUnit(
  language: Language,
  value: TranslationArg,
  unit: keyof (typeof unitLabels)[Language],
): string {
  const numericValue = Number(value);
  const [singular, plural] = unitLabels[language][unit];
  return `${numericValue} ${numericValue === 1 ? singular : plural}`;
}

function safelyReadStoredLanguage(): string | null {
  try {
    return window.localStorage.getItem("couple-memories-language");
  } catch {
    return null;
  }
}
