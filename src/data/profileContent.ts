import type { TranslationKey } from "../i18n/translations";
import type { ImageCrop } from "../utils/imageCrop";

export type ProfileRole = "her" | "him";

export type ProfilePerson = {
  role: ProfileRole;
  name: string;
  avatarSrc: string;
  avatarAltKey: TranslationKey;
  avatarCrop?: ImageCrop;
  birthday: string;
  accentColor: string;
  description: string;
  statusNote: string;
};

export type CoupleProfile = {
  people: Record<ProfileRole, ProfilePerson>;
};

export const defaultProfile: CoupleProfile = {
  people: {
    her: {
      role: "her",
      name: "Lesli",
      avatarSrc: "/images/she.jpg",
      avatarAltKey: "profile.her.avatarAlt",
      birthday: "2002-04-01",
      accentColor: "#ed93b1",
      description: "Loves sunset walks, coffee dates, and tiny details.",
      statusNote: "Hoy quiero ir por un cafecito ☕",
    },
    him: {
      role: "him",
      name: "Yair",
      avatarSrc: "/images/me.jpg",
      avatarAltKey: "profile.him.avatarAlt",
      birthday: "2002-08-16",
      accentColor: "#4d9cff",
      description: "Keeps the map, photos, and every little story organized.",
      statusNote: "Dia de bici 🚴",
    },
  },
};
