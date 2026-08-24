import { useContext } from "react";
import { CurrentPersonContext } from "./currentPersonContextValue";

export function useCurrentPerson() {
  const context = useContext(CurrentPersonContext);
  if (!context) {
    throw new Error("useCurrentPerson must be used within CurrentPersonProvider");
  }
  return context;
}
