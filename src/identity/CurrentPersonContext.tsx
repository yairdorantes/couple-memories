import { useMemo, useState } from "react";
import type React from "react";
import type { ProfileRole } from "../data/profileContent";
import {
  getStoredCurrentPerson,
  setStoredCurrentPerson,
} from "./currentPersonStorage";
import {
  CurrentPersonContext,
  type CurrentPersonContextValue,
} from "./currentPersonContextValue";

type CurrentPersonProviderProps = {
  children: React.ReactNode;
};

export function CurrentPersonProvider({ children }: CurrentPersonProviderProps) {
  const [currentPersonRole, setCurrentPersonRoleState] = useState<ProfileRole>(
    () => getStoredCurrentPerson(),
  );

  const value = useMemo<CurrentPersonContextValue>(
    () => ({
      currentPersonRole,
      setCurrentPersonRole: (role) => {
        setStoredCurrentPerson(role);
        setCurrentPersonRoleState(role);
      },
    }),
    [currentPersonRole],
  );

  return (
    <CurrentPersonContext.Provider value={value}>
      {children}
    </CurrentPersonContext.Provider>
  );
}
