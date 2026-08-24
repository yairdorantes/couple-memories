export type IntimacyMoodId = "tender" | "passionate" | "quiet" | "special";

export type IntimacyEntry = {
  id: string;
  title: string;
  happenedAt: string;
  place: string;
  mood: IntimacyMoodId;
  note: string;
  isFavorite: boolean;
};

export type IntimacyDraft = Omit<IntimacyEntry, "id" | "isFavorite"> & {
  isFavorite?: boolean;
};

export const intimacyMoods: Array<{
  id: IntimacyMoodId;
  icon: string;
  label: string;
}> = [
  { id: "tender", icon: "💗", label: "Cariñoso" },
  { id: "passionate", icon: "🔥", label: "Pasional" },
  { id: "quiet", icon: "🌙", label: "Tranquilo" },
  { id: "special", icon: "✨", label: "Especial" },
];

export const intimacyEntries: IntimacyEntry[] = [
  {
    id: "night-note",
    title: "Noche tranquila",
    happenedAt: "2026-08-22T23:40",
    place: "Casa",
    mood: "tender",
    note: "Nos quedamos abrazados y hablando bajito.",
    isFavorite: true,
  },
  {
    id: "rainy-evening",
    title: "Después de la lluvia",
    happenedAt: "2026-08-18T22:15",
    place: "Casa",
    mood: "quiet",
    note: "Un momento lento, bonito y muy nuestro.",
    isFavorite: false,
  },
  {
    id: "weekend-glow",
    title: "Sábado especial",
    happenedAt: "2026-08-10T00:20",
    place: "Hotel",
    mood: "special",
    note: "Escapada corta, música suave y cero prisa.",
    isFavorite: true,
  },
  {
    id: "coffee-after",
    title: "Cita en casa",
    happenedAt: "2026-07-31T23:05",
    place: "Casa",
    mood: "passionate",
    note: "Terminamos preparando café de madrugada.",
    isFavorite: false,
  },
];
