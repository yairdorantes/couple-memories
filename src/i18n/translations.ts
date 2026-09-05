import { getDateForDisplay } from "../utils/dateTime";

export const supportedLanguages = ["en", "es"] as const;

export type Language = (typeof supportedLanguages)[number];

export type TranslationKey =
  | "app.title"
  | "hero.imageAlt"
  | "hero.avatarOneAlt"
  | "hero.avatarTwoAlt"
  | "hero.togetherLine"
  | "hero.anniversaryIn"
  | "home.status.ariaLabel"
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
  | "featured.loading"
  | "featured.emptyTitle"
  | "featured.emptyCaption"
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
  | "nav.intimacy"
  | "nav.recap"
  | "nav.profile"
  | "imageCrop.title"
  | "imageCrop.x"
  | "imageCrop.y"
  | "imageCrop.zoom"
  | "imageCrop.cover"
  | "imageCrop.contain"
  | "imageCrop.reset"
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
  | "memories.calendar.monthLabel"
  | "memories.calendar.yearLabel"
  | "memories.calendar.selectedDate"
  | "memories.calendar.selectedRange"
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
  | "places.title"
  | "places.count"
  | "places.subtitle"
  | "places.map.ariaLabel"
  | "places.map.missingTokenTitle"
  | "places.map.missingToken"
  | "places.emptyTitle"
  | "places.emptyCopy"
  | "places.detail.visited"
  | "places.detail.memories"
  | "places.detail.viewMemories"
  | "places.category.trip"
  | "places.category.coffee"
  | "places.category.home"
  | "places.category.date"
  | "places.place.cholula.name"
  | "places.place.cholula.description"
  | "places.place.pueblaCafe.name"
  | "places.place.pueblaCafe.description"
  | "places.place.home.name"
  | "places.place.home.description"
  | "places.memory.coffeeAfterRain"
  | "places.memory.movieNight"
  | "intimacy.eyebrow"
  | "intimacy.title"
  | "intimacy.subtitle"
  | "intimacy.add"
  | "intimacy.loading"
  | "intimacy.error"
  | "intimacy.statsLabel"
  | "intimacy.thisMonth"
  | "intimacy.allTime"
  | "intimacy.toggleCount"
  | "intimacy.streak"
  | "intimacy.average"
  | "intimacy.weeks"
  | "intimacy.calendarEyebrow"
  | "intimacy.calendar.previousMonth"
  | "intimacy.calendar.nextMonth"
  | "intimacy.calendar.monthLabel"
  | "intimacy.calendar.yearLabel"
  | "intimacy.clearDate"
  | "intimacy.filtersLabel"
  | "intimacy.filter.all"
  | "intimacy.filter.month"
  | "intimacy.filter.favorites"
  | "intimacy.timelineLabel"
  | "intimacy.timelineEyebrow"
  | "intimacy.timelineTitle"
  | "intimacy.empty"
  | "intimacy.addFirst"
  | "intimacy.favorite"
  | "intimacy.actions.menu"
  | "intimacy.actions.favorite"
  | "intimacy.actions.unfavorite"
  | "intimacy.actions.edit"
  | "intimacy.actions.delete"
  | "intimacy.feedback.created"
  | "intimacy.feedback.updated"
  | "intimacy.feedback.deleted"
  | "intimacy.form.title"
  | "intimacy.form.editTitle"
  | "intimacy.form.titleLabel"
  | "intimacy.form.titlePlaceholder"
  | "intimacy.form.dateLabel"
  | "intimacy.form.placeLabel"
  | "intimacy.form.placePlaceholder"
  | "intimacy.form.moodLabel"
  | "intimacy.form.noteLabel"
  | "intimacy.form.notePlaceholder"
  | "intimacy.form.favoriteLabel"
  | "intimacy.form.defaultTitle"
  | "intimacy.form.defaultPlace"
  | "intimacy.form.defaultNote"
  | "intimacy.form.cancel"
  | "intimacy.form.save"
  | "intimacy.form.update"
  | "profile.eyebrow"
  | "profile.title"
  | "profile.subtitle"
  | "profile.her"
  | "profile.him"
  | "profile.useAsMe"
  | "profile.selectedPerson"
  | "profile.her.avatarAlt"
  | "profile.him.avatarAlt"
  | "profile.edit"
  | "profile.save"
  | "profile.cancel"
  | "profile.avatar.change"
  | "profile.name"
  | "profile.birthday"
  | "profile.accentColor"
  | "profile.description"
  | "profile.note.empty"
  | "profile.hero.title"
  | "profile.hero.subtitle"
  | "profile.hero.add"
  | "profile.hero.saving"
  | "profile.hero.loading"
  | "profile.hero.empty"
  | "profile.hero.remove"
  | "profile.hero.previewAlt"
  | "profile.hero.saved"
  | "profile.hero.error"
  | "memoryForm.title"
  | "memoryForm.editTitle"
  | "memoryForm.titleLabel"
  | "memoryForm.titlePlaceholder"
  | "memoryForm.captionLabel"
  | "memoryForm.captionPlaceholder"
  | "memoryForm.locationLabel"
  | "memoryForm.locationPlaceholder"
  | "memoryForm.coordinatesLabel"
  | "memoryForm.coordinatesHint"
  | "memoryForm.latitudeLabel"
  | "memoryForm.longitudeLabel"
  | "memoryForm.photoLabel"
  | "memoryForm.photoButton"
  | "memoryForm.photoSelected"
  | "memoryForm.dateLabel"
  | "memoryForm.categoryLabel"
  | "memoryForm.emojiLabel"
  | "memoryForm.cancel"
  | "memoryForm.save"
  | "memoryForm.update"
  | "memoryDetail.back"
  | "memoryDetail.photoCount"
  | "memoryDetail.collectionEyebrow"
  | "memoryDetail.collectionTitle"
  | "memoryDetail.addPhoto"
  | "memoryDetail.openPhoto"
  | "memoryDetail.editPhoto"
  | "memoryDetail.removePhoto"
  | "memoryDetail.removeConfirm"
  | "memoryDetail.removed"
  | "memoryDetail.added"
  | "memoryDetail.loading"
  | "memoryDetail.notFoundTitle"
  | "memoryDetail.notFoundCopy"
  | "memoryDetail.backToMemories"
  | "memoryDetail.noPhotos"
  | "memoryDetail.closePhoto"
  | "memoryDetail.previousPhoto"
  | "memoryDetail.nextPhoto"
  | "memoryDetail.addDialogTitle"
  | "memoryDetail.editDialogTitle"
  | "memoryDetail.photoLabel"
  | "memoryDetail.captionLabel"
  | "memoryDetail.captionPlaceholder"
  | "memoryDetail.dateLabel"
  | "memoryDetail.locationLabel"
  | "memoryDetail.locationPlaceholder"
  | "memoryDetail.latitudeLabel"
  | "memoryDetail.longitudeLabel"
  | "memoryDetail.coordinatesHint"
  | "memoryDetail.addingPhoto"
  | "memoryDetail.addPhotoSubmit"
  | "memoryDetail.savingPhoto"
  | "memoryDetail.savePhoto"
  | "memoryDetail.updated"
  | "memoryDetail.cancel"
  | "memoryDetail.photoRequired"
  | "memoryDetail.photoTypeError"
  | "memoryDetail.coordinatesError"
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
    "home.status.ariaLabel": "Couple status notes",
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
    "featured.loading": "Finding a memory...",
    "featured.emptyTitle": "No memories yet",
    "featured.emptyCaption": "Save your first memory and it will appear here.",
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
    "nav.intimacy": "Intimacy",
    "nav.recap": "Recap",
    "nav.profile": "Profile",
    "imageCrop.title": "Image position",
    "imageCrop.x": "Horizontal",
    "imageCrop.y": "Vertical",
    "imageCrop.zoom": "Zoom",
    "imageCrop.cover": "Fill frame",
    "imageCrop.contain": "Show full",
    "imageCrop.reset": "Center image",
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
    "memories.calendar.monthLabel": "Month",
    "memories.calendar.yearLabel": "Year",
    "memories.calendar.selectedDate": (date) => `Memories on ${date}`,
    "memories.calendar.selectedRange": (start, end) =>
      `Memories from ${start} to ${end}`,
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
    "places.title": "Places",
    "places.count": (count) =>
      `${count} place${count === 1 ? "" : "s"} visited together`,
    "places.subtitle":
      "A map of the stops, dates, and memories we keep coming back to.",
    "places.map.ariaLabel": "Map of places visited together",
    "places.map.missingTokenTitle": "Mapbox token missing",
    "places.map.missingToken":
      "Add VITE_MAPBOX_ACCESS_TOKEN to your environment to show the map.",
    "places.emptyTitle": "No places yet",
    "places.emptyCopy":
      "Add coordinates to a memory and it will appear here automatically.",
    "places.detail.visited": "Visited",
    "places.detail.memories": (count) =>
      `${count} linked memor${count === 1 ? "y" : "ies"}`,
    "places.detail.viewMemories": "View memories",
    "places.category.trip": "Trip",
    "places.category.coffee": "Coffee",
    "places.category.home": "Home",
    "places.category.date": "Date",
    "places.place.cholula.name": "Cholula",
    "places.place.cholula.description":
      "Our first trip together: colorful streets, slow walks, and sunset plans.",
    "places.place.pueblaCafe.name": "Cafe after the rain",
    "places.place.pueblaCafe.description":
      "A quiet Puebla stop where the rain made everything feel softer.",
    "places.place.home.name": "Home sweet home",
    "places.place.home.description":
      "Movie nights, shared snacks, and the small moments that feel like ours.",
    "places.memory.coffeeAfterRain": "Cafe after the rain",
    "places.memory.movieNight": "Movie night",
    "intimacy.eyebrow": "Private rhythm",
    "intimacy.title": "Intimacy",
    "intimacy.subtitle": (count) =>
      `${count} intimate moment${Number(count) === 1 ? "" : "s"} this month`,
    "intimacy.add": "Moment",
    "intimacy.loading": "Loading intimacy records",
    "intimacy.error": "Could not load local records. Showing sample data.",
    "intimacy.statsLabel": "Intimacy summary",
    "intimacy.thisMonth": "This month",
    "intimacy.allTime": "All time",
    "intimacy.toggleCount":
      "Switch intimacy count between this month and all time",
    "intimacy.streak": "Streak",
    "intimacy.average": "Avg / week",
    "intimacy.weeks": (count) => `${count} wk`,
    "intimacy.calendarEyebrow": "Calendar",
    "intimacy.calendar.previousMonth": "Previous month",
    "intimacy.calendar.nextMonth": "Next month",
    "intimacy.calendar.monthLabel": "Month",
    "intimacy.calendar.yearLabel": "Year",
    "intimacy.clearDate": "Clear date",
    "intimacy.filtersLabel": "Intimacy filters",
    "intimacy.filter.all": "All",
    "intimacy.filter.month": "This month",
    "intimacy.filter.favorites": "Favorites",
    "intimacy.timelineLabel": "Intimacy timeline",
    "intimacy.timelineEyebrow": "Recent",
    "intimacy.timelineTitle": "Private moments",
    "intimacy.empty": "No moments match this view yet.",
    "intimacy.addFirst": "Add moment",
    "intimacy.favorite": "Favorite",
    "intimacy.actions.menu": "Intimacy record actions",
    "intimacy.actions.favorite": "Mark favorite",
    "intimacy.actions.unfavorite": "Remove favorite",
    "intimacy.actions.edit": "Edit record",
    "intimacy.actions.delete": "Delete record",
    "intimacy.feedback.created": "Moment saved",
    "intimacy.feedback.updated": "Moment updated",
    "intimacy.feedback.deleted": "Moment deleted",
    "intimacy.form.title": "Save private moment",
    "intimacy.form.editTitle": "Edit private moment",
    "intimacy.form.titleLabel": "Title",
    "intimacy.form.titlePlaceholder": "e.g. Quiet night",
    "intimacy.form.dateLabel": "Date and time",
    "intimacy.form.placeLabel": "Place",
    "intimacy.form.placePlaceholder": "e.g. Home",
    "intimacy.form.moodLabel": "Mood",
    "intimacy.form.noteLabel": "Private note",
    "intimacy.form.notePlaceholder": "Keep it short and personal...",
    "intimacy.form.favoriteLabel": "Mark as favorite",
    "intimacy.form.defaultTitle": "Private moment",
    "intimacy.form.defaultPlace": "Private place",
    "intimacy.form.defaultNote": "A moment just for us.",
    "intimacy.form.cancel": "Cancel",
    "intimacy.form.save": "Save moment",
    "intimacy.form.update": "Update moment",
    "profile.eyebrow": "Couple profile",
    "profile.title": "Profile",
    "profile.subtitle": (names) => `Profiles and personal notes for ${names}`,
    "profile.her": "Her",
    "profile.him": "Him",
    "profile.useAsMe": (role) => `Use as ${role}`,
    "profile.selectedPerson": (role) => `This device is using ${role}`,
    "profile.her.avatarAlt": "Her profile avatar",
    "profile.him.avatarAlt": "His profile avatar",
    "profile.edit": "Edit",
    "profile.save": "Save",
    "profile.cancel": "Cancel",
    "profile.avatar.change": "Change photo",
    "profile.name": "Name",
    "profile.birthday": "Birthday",
    "profile.accentColor": "Favorite color",
    "profile.description": "About",
    "profile.note.empty": "Add a note...",
    "profile.hero.title": "Home hero photos",
    "profile.hero.subtitle":
      "Pick the photos used for the main Home image. One is chosen randomly on each load.",
    "profile.hero.add": "Add hero photo",
    "profile.hero.saving": "Saving...",
    "profile.hero.loading": "Loading hero photos...",
    "profile.hero.empty": "Add a few favorite photos.",
    "profile.hero.remove": "Remove hero photo",
    "profile.hero.previewAlt": "Saved home hero photo",
    "profile.hero.saved": "Hero photos updated",
    "profile.hero.error": "Could not save the hero photo. Try a smaller image.",
    "memoryForm.title": "Save Memory",
    "memoryForm.editTitle": "Edit Memory",
    "memoryForm.titleLabel": "Title",
    "memoryForm.titlePlaceholder": "Title (e.g. Sunset Walk)",
    "memoryForm.captionLabel": "Caption",
    "memoryForm.captionPlaceholder": "Caption / Memory notes",
    "memoryForm.locationLabel": "Location",
    "memoryForm.locationPlaceholder": "Location (e.g. Cholula)",
    "memoryForm.coordinatesLabel": "Location coordinates",
    "memoryForm.coordinatesHint":
      "Optional. Memories with coordinates appear in Places.",
    "memoryForm.latitudeLabel": "Latitude",
    "memoryForm.longitudeLabel": "Longitude",
    "memoryForm.photoLabel": "Main photo",
    "memoryForm.photoButton": "Choose photo",
    "memoryForm.photoSelected": "Photo selected",
    "memoryForm.dateLabel": "Memory date and time",
    "memoryForm.categoryLabel": "Category",
    "memoryForm.emojiLabel": "Mood emoji",
    "memoryForm.cancel": "Cancel",
    "memoryForm.save": "Save Memory",
    "memoryForm.update": "Update Memory",
    "memoryDetail.back": "Memories",
    "memoryDetail.photoCount": (count) => `${count} photo${Number(count) === 1 ? "" : "s"}`,
    "memoryDetail.collectionEyebrow": "Photo collection",
    "memoryDetail.collectionTitle": "Every frame from this day",
    "memoryDetail.addPhoto": "Add photo",
    "memoryDetail.openPhoto": (index, count) => `Open photo ${index} of ${count}`,
    "memoryDetail.editPhoto": (index) => `Edit photo ${index} metadata`,
    "memoryDetail.removePhoto": (index) => `Remove photo ${index} from memory`,
    "memoryDetail.removeConfirm": "Remove this photo from the memory? The original uploaded file will be kept.",
    "memoryDetail.removed": "Photo removed from memory",
    "memoryDetail.added": "Photo added to memory",
    "memoryDetail.loading": "Loading memory...",
    "memoryDetail.notFoundTitle": "Memory not found",
    "memoryDetail.notFoundCopy": "This memory may have been removed.",
    "memoryDetail.backToMemories": "Back to memories",
    "memoryDetail.noPhotos": "Add the first photo from this memory.",
    "memoryDetail.closePhoto": "Close photo",
    "memoryDetail.previousPhoto": "Previous photo",
    "memoryDetail.nextPhoto": "Next photo",
    "memoryDetail.addDialogTitle": "Add photo",
    "memoryDetail.editDialogTitle": "Edit photo details",
    "memoryDetail.photoLabel": "Photo",
    "memoryDetail.captionLabel": "Caption",
    "memoryDetail.captionPlaceholder": "A note about this frame",
    "memoryDetail.dateLabel": "Date and time",
    "memoryDetail.locationLabel": "Location",
    "memoryDetail.locationPlaceholder": "Optional photo location",
    "memoryDetail.latitudeLabel": "Latitude",
    "memoryDetail.longitudeLabel": "Longitude",
    "memoryDetail.coordinatesHint": "Coordinates add this photo's location to Places.",
    "memoryDetail.addingPhoto": "Adding...",
    "memoryDetail.addPhotoSubmit": "Add photo",
    "memoryDetail.savingPhoto": "Saving...",
    "memoryDetail.savePhoto": "Save changes",
    "memoryDetail.updated": "Photo details updated",
    "memoryDetail.cancel": "Cancel",
    "memoryDetail.photoRequired": "Choose a photo to add.",
    "memoryDetail.photoTypeError": "Use a JPG, PNG, WEBP, or HEIC image.",
    "memoryDetail.coordinatesError": "Enter valid latitude and longitude together, or leave both empty.",
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
    "home.status.ariaLabel": "Notas de estado de la pareja",
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
    "featured.loading": "Buscando un recuerdo...",
    "featured.emptyTitle": "Aun no hay recuerdos",
    "featured.emptyCaption": "Guarda el primer recuerdo y aparecera aqui.",
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
    "nav.intimacy": "Intimidad",
    "nav.recap": "Resumen",
    "nav.profile": "Perfil",
    "imageCrop.title": "Posicion de imagen",
    "imageCrop.x": "Horizontal",
    "imageCrop.y": "Vertical",
    "imageCrop.zoom": "Zoom",
    "imageCrop.cover": "Llenar marco",
    "imageCrop.contain": "Ver completa",
    "imageCrop.reset": "Centrar imagen",
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
    "memories.calendar.monthLabel": "Mes",
    "memories.calendar.yearLabel": "Año",
    "memories.calendar.selectedDate": (date) => `Recuerdos del ${date}`,
    "memories.calendar.selectedRange": (start, end) =>
      `Recuerdos del ${start} al ${end}`,
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
    "places.title": "Lugares",
    "places.count": (count) =>
      `${count} lugar${count === 1 ? "" : "es"} visitado${count === 1 ? "" : "s"} juntos`,
    "places.subtitle":
      "Un mapa de las paradas, fechas y recuerdos a los que siempre volvemos.",
    "places.map.ariaLabel": "Mapa de lugares visitados juntos",
    "places.map.missingTokenTitle": "Falta el token de Mapbox",
    "places.map.missingToken":
      "Agrega VITE_MAPBOX_ACCESS_TOKEN a tu entorno para mostrar el mapa.",
    "places.emptyTitle": "Aun no hay lugares",
    "places.emptyCopy":
      "Agrega coordenadas a un recuerdo y aparecera aqui automaticamente.",
    "places.detail.visited": "Visitado",
    "places.detail.memories": (count) =>
      `${count} recuerdo${count === 1 ? "" : "s"} vinculado${count === 1 ? "" : "s"}`,
    "places.detail.viewMemories": "Ver recuerdos",
    "places.category.trip": "Viaje",
    "places.category.coffee": "Cafe",
    "places.category.home": "Casa",
    "places.category.date": "Cita",
    "places.place.cholula.name": "Cholula",
    "places.place.cholula.description":
      "Nuestro primer viaje juntos: calles coloridas, caminatas lentas y planes al atardecer.",
    "places.place.pueblaCafe.name": "Cafe despues de la lluvia",
    "places.place.pueblaCafe.description":
      "Una parada tranquila en Puebla donde la lluvia hizo todo mas suave.",
    "places.place.home.name": "Home sweet home",
    "places.place.home.description":
      "Noches de pelicula, snacks compartidos y momentos pequenos que se sienten nuestros.",
    "places.memory.coffeeAfterRain": "Cafe despues de la lluvia",
    "places.memory.movieNight": "Noche de pelicula",
    "intimacy.eyebrow": "Ritmo privado",
    "intimacy.title": "Intimidad",
    "intimacy.subtitle": (count) =>
      `${count} momento${Number(count) === 1 ? "" : "s"} íntimo${Number(count) === 1 ? "" : "s"} este mes`,
    "intimacy.add": "Momento",
    "intimacy.loading": "Cargando registros de intimidad",
    "intimacy.error":
      "No se pudieron cargar los registros locales. Mostrando datos de ejemplo.",
    "intimacy.statsLabel": "Resumen de intimidad",
    "intimacy.thisMonth": "Este mes",
    "intimacy.allTime": "Todo el tiempo",
    "intimacy.toggleCount":
      "Cambiar contador de intimidad entre este mes y todo el tiempo",
    "intimacy.streak": "Racha",
    "intimacy.average": "Prom / semana",
    "intimacy.weeks": (count) => `${count} sem`,
    "intimacy.calendarEyebrow": "Calendario",
    "intimacy.calendar.previousMonth": "Mes anterior",
    "intimacy.calendar.nextMonth": "Mes siguiente",
    "intimacy.calendar.monthLabel": "Mes",
    "intimacy.calendar.yearLabel": "Año",
    "intimacy.clearDate": "Quitar fecha",
    "intimacy.filtersLabel": "Filtros de intimidad",
    "intimacy.filter.all": "Todo",
    "intimacy.filter.month": "Este mes",
    "intimacy.filter.favorites": "Favoritos",
    "intimacy.timelineLabel": "Linea de tiempo de intimidad",
    "intimacy.timelineEyebrow": "Reciente",
    "intimacy.timelineTitle": "Momentos privados",
    "intimacy.empty": "No hay momentos en esta vista todavía.",
    "intimacy.addFirst": "Agregar momento",
    "intimacy.favorite": "Favorito",
    "intimacy.actions.menu": "Acciones del registro íntimo",
    "intimacy.actions.favorite": "Marcar favorito",
    "intimacy.actions.unfavorite": "Quitar favorito",
    "intimacy.actions.edit": "Editar registro",
    "intimacy.actions.delete": "Eliminar registro",
    "intimacy.feedback.created": "Momento guardado",
    "intimacy.feedback.updated": "Momento actualizado",
    "intimacy.feedback.deleted": "Momento eliminado",
    "intimacy.form.title": "Guardar momento privado",
    "intimacy.form.editTitle": "Editar momento privado",
    "intimacy.form.titleLabel": "Titulo",
    "intimacy.form.titlePlaceholder": "ej. Noche tranquila",
    "intimacy.form.dateLabel": "Fecha y hora",
    "intimacy.form.placeLabel": "Lugar",
    "intimacy.form.placePlaceholder": "ej. Casa",
    "intimacy.form.moodLabel": "Mood",
    "intimacy.form.noteLabel": "Nota privada",
    "intimacy.form.notePlaceholder": "Algo corto y personal...",
    "intimacy.form.favoriteLabel": "Marcar como favorito",
    "intimacy.form.defaultTitle": "Momento privado",
    "intimacy.form.defaultPlace": "Lugar privado",
    "intimacy.form.defaultNote": "Un momento solo nuestro.",
    "intimacy.form.cancel": "Cancelar",
    "intimacy.form.save": "Guardar momento",
    "intimacy.form.update": "Actualizar momento",
    "profile.eyebrow": "Perfil de pareja",
    "profile.title": "Perfil",
    "profile.subtitle": (names) => `Perfiles y notas personales para ${names}`,
    "profile.her": "Ella",
    "profile.him": "El",
    "profile.useAsMe": (role) => `Usar como ${role}`,
    "profile.selectedPerson": (role) => `Este dispositivo usa ${role}`,
    "profile.her.avatarAlt": "Avatar de ella",
    "profile.him.avatarAlt": "Avatar de el",
    "profile.edit": "Editar",
    "profile.save": "Guardar",
    "profile.cancel": "Cancelar",
    "profile.avatar.change": "Cambiar foto",
    "profile.name": "Nombre",
    "profile.birthday": "Cumpleanos",
    "profile.accentColor": "Color favorito",
    "profile.description": "Sobre",
    "profile.note.empty": "Agregar una nota...",
    "profile.hero.title": "Fotos principales de inicio",
    "profile.hero.subtitle":
      "Elige las fotos que se usan en la imagen principal de Inicio. Una se escoge al azar cada vez que carga.",
    "profile.hero.add": "Agregar foto principal",
    "profile.hero.saving": "Guardando...",
    "profile.hero.loading": "Cargando fotos principales...",
    "profile.hero.empty": "Agrega algunas fotos favoritas",
    "profile.hero.remove": "Eliminar foto principal",
    "profile.hero.previewAlt": "Foto principal guardada",
    "profile.hero.saved": "Fotos principales actualizadas",
    "profile.hero.error":
      "No se pudo guardar la foto principal. Intenta con una imagen mas pequena.",
    "memoryForm.title": "Guardar recuerdo",
    "memoryForm.editTitle": "Editar recuerdo",
    "memoryForm.titleLabel": "Titulo",
    "memoryForm.titlePlaceholder": "Titulo (ej. Caminata al atardecer)",
    "memoryForm.captionLabel": "Caption",
    "memoryForm.captionPlaceholder": "Caption / notas del recuerdo",
    "memoryForm.locationLabel": "Lugar",
    "memoryForm.locationPlaceholder": "Lugar (ej. Cholula)",
    "memoryForm.coordinatesLabel": "Coordenadas",
    "memoryForm.coordinatesHint":
      "Opcional. Los recuerdos con coordenadas aparecen en Lugares.",
    "memoryForm.latitudeLabel": "Latitud",
    "memoryForm.longitudeLabel": "Longitud",
    "memoryForm.photoLabel": "Foto principal",
    "memoryForm.photoButton": "Elegir foto",
    "memoryForm.photoSelected": "Foto seleccionada",
    "memoryForm.dateLabel": "Fecha y hora del recuerdo",
    "memoryForm.categoryLabel": "Categoria",
    "memoryForm.emojiLabel": "Emoji",
    "memoryForm.cancel": "Cancelar",
    "memoryForm.save": "Guardar recuerdo",
    "memoryForm.update": "Actualizar recuerdo",
    "memoryDetail.back": "Recuerdos",
    "memoryDetail.photoCount": (count) => `${count} foto${Number(count) === 1 ? "" : "s"}`,
    "memoryDetail.collectionEyebrow": "Coleccion de fotos",
    "memoryDetail.collectionTitle": "Cada momento de este dia",
    "memoryDetail.addPhoto": "Agregar foto",
    "memoryDetail.openPhoto": (index, count) => `Abrir foto ${index} de ${count}`,
    "memoryDetail.editPhoto": (index) => `Editar datos de la foto ${index}`,
    "memoryDetail.removePhoto": (index) => `Quitar foto ${index} del recuerdo`,
    "memoryDetail.removeConfirm": "¿Quitar esta foto del recuerdo? El archivo original se conservara.",
    "memoryDetail.removed": "Foto quitada del recuerdo",
    "memoryDetail.added": "Foto agregada al recuerdo",
    "memoryDetail.loading": "Cargando recuerdo...",
    "memoryDetail.notFoundTitle": "No se encontro el recuerdo",
    "memoryDetail.notFoundCopy": "Es posible que este recuerdo haya sido eliminado.",
    "memoryDetail.backToMemories": "Volver a recuerdos",
    "memoryDetail.noPhotos": "Agrega la primera foto de este recuerdo.",
    "memoryDetail.closePhoto": "Cerrar foto",
    "memoryDetail.previousPhoto": "Foto anterior",
    "memoryDetail.nextPhoto": "Siguiente foto",
    "memoryDetail.addDialogTitle": "Agregar foto",
    "memoryDetail.editDialogTitle": "Editar detalles de la foto",
    "memoryDetail.photoLabel": "Foto",
    "memoryDetail.captionLabel": "Descripcion",
    "memoryDetail.captionPlaceholder": "Una nota sobre esta foto",
    "memoryDetail.dateLabel": "Fecha y hora",
    "memoryDetail.locationLabel": "Lugar",
    "memoryDetail.locationPlaceholder": "Lugar opcional de la foto",
    "memoryDetail.latitudeLabel": "Latitud",
    "memoryDetail.longitudeLabel": "Longitud",
    "memoryDetail.coordinatesHint": "Las coordenadas agregan el lugar de esta foto a Lugares.",
    "memoryDetail.addingPhoto": "Agregando...",
    "memoryDetail.addPhotoSubmit": "Agregar foto",
    "memoryDetail.savingPhoto": "Guardando...",
    "memoryDetail.savePhoto": "Guardar cambios",
    "memoryDetail.updated": "Detalles de la foto actualizados",
    "memoryDetail.cancel": "Cancelar",
    "memoryDetail.photoRequired": "Elige una foto para agregar.",
    "memoryDetail.photoTypeError": "Usa una imagen JPG, PNG, WEBP o HEIC.",
    "memoryDetail.coordinatesError": "Ingresa latitud y longitud validas juntas, o deja ambas vacias.",
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
  }).format(getDateForDisplay(dateInput));
}

export function formatDateTime(dateInput: string, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(getDateForDisplay(dateInput));
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
