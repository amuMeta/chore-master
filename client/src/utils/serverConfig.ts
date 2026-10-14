/**
 * Backend base URL for Tauri / mobile / desktop builds.
 *
 * The web build talks to the backend through the Vite proxy (`/api` -> :3000),
 * so it uses a same-origin relative base. A packaged app has no proxy: the
 * webview loads `tauri://localhost` (or `http://localhost` on Android), so
 * `/api` resolves to nothing. In that case the user must point the app at a
 * reachable server, e.g. `http://192.168.1.20:3000`.
 */
const LS_KEY = 'tidyquest_server_url';

/** True when running inside a Tauri shell (desktop or mobile webview). */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function getServerUrl(): string {
  try {
    return localStorage.getItem(LS_KEY) || '';
  } catch {
    return '';
  }
}

export function setServerUrl(url: string): void {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (clean) localStorage.setItem(LS_KEY, clean);
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

/** Base for API calls: configured server, or '' (same-origin) for the web build. */
export function getApiBase(): string {
  return getServerUrl();
}

export function apiUrl(path: string): string {
  return `${getApiBase()}${path}`;
}

/** Absolute URL for backend-served assets (uploads, avatars). */
export function assetUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  const base = getServerUrl();
  if (!base) return url;
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
