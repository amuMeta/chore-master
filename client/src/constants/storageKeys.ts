/**
 * Single source of truth for localStorage keys.
 *
 * New keys use the `${BRAND.techRoot}_` prefix only. LEGACY holds every historical
 * key ever used — when a key is renamed, append its old name there and `readLS`
 * will migrate existing values forward on next read, transparently.
 */
import { BRAND } from '../brand';

const R = BRAND.techRoot;

export const LS_KEYS = {
  token: `${R}_token`,
  theme: `${R}_theme`,
  sidebarCollapsed: `${R}_sidebar_collapsed`,
  authLang: `${R}_auth_lang`,
  taskFilter: `${R}_task_filter`,
  dashboardCards: `${R}_dashboard_cards`,
} as const;

export type LSKey = keyof typeof LS_KEYS;

/** Historical key names, read-only fallback. Never write to these. */
const LEGACY: Record<LSKey, string> = {
  token: 'tidyquest_token',
  theme: 'tidyquest_theme',
  sidebarCollapsed: 'tidyquest-sidebar-collapsed',
  authLang: 'tidyquest_auth_lang',
  taskFilter: 'tq-task-filter',
  dashboardCards: 'tq-dashboard-cards',
};

/**
 * Read a value, falling back to its legacy key.
 * On a legacy hit the value is copied to the new key and the old one removed,
 * so users never notice a key rename (no forced logout, no lost preferences).
 */
export function readLS(key: LSKey): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const current = localStorage.getItem(LS_KEYS[key]);
    if (current !== null) return current;
    const old = localStorage.getItem(LEGACY[key]);
    if (old !== null) {
      localStorage.setItem(LS_KEYS[key], old);
      localStorage.removeItem(LEGACY[key]);
    }
    return old;
  } catch {
    return null;
  }
}

export function writeLS(key: LSKey, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LS_KEYS[key], value);
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

export function removeLS(key: LSKey): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(LS_KEYS[key]);
    localStorage.removeItem(LEGACY[key]);
  } catch {
    /* ignore */
  }
}
