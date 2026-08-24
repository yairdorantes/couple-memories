import type { ProfileRole } from "../data/profileContent";

const currentPersonStorageKey = "couple-memories-current-person";
const validRoles = new Set<ProfileRole>(["her", "him"]);

export function getStoredCurrentPerson(): ProfileRole {
  try {
    const storedRole = window.localStorage.getItem(currentPersonStorageKey);
    return validRoles.has(storedRole as ProfileRole) ? (storedRole as ProfileRole) : "him";
  } catch {
    return "him";
  }
}

export function setStoredCurrentPerson(role: ProfileRole) {
  try {
    window.localStorage.setItem(currentPersonStorageKey, role);
  } catch {
    // Local identity is a convenience only; keep the app usable if storage is blocked.
  }
}
