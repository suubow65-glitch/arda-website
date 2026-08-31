const isBrowser = typeof window !== "undefined";

export function getLocalItem<T>(key: string): T | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setLocalItem<T>(key: string, value: T) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or disabled — ignore
  }
}

export function removeLocalItem(key: string) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const storageKeys = {
  settings: "arda_public_settings",
  about: "arda_public_about",
  impactStats: "arda_public_impact_stats",
  partners: "arda_public_partners",
  team: "arda_public_team",
  vacancies: "arda_public_vacancies",
  slides: "arda_public_slides",
  activities: "arda_public_activities",
  documents: "arda_public_documents",
};
