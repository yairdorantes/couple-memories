import { createContext } from "react";
import type { ProfileRole } from "../data/profileContent";

export type CurrentPersonContextValue = {
  currentPersonRole: ProfileRole;
  setCurrentPersonRole: (role: ProfileRole) => void;
};

export const CurrentPersonContext = createContext<CurrentPersonContextValue | null>(null);
