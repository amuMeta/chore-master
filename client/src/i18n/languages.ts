/**
 * Single source of truth for supported languages.
 *
 * Adding a new language = add one entry here + drop a <code>.json in this folder
 * + register the import in ../hooks/useTranslation.ts.
 *
 * `locale` is a full BCP-47 tag handed to Intl.* / toLocaleDateString, which
 * is why it is kept alongside the short code rather than derived from it.
 */
export interface LanguageDef {
  /** Short code stored in users.language and localStorage */
  code: string;
  /** Endonym shown in language pickers — never translated */
  label: string;
  /** Full BCP-47 tag for Intl.* APIs */
  locale: string;
}

export const LANGUAGES: LanguageDef[] = [
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'fr', label: 'Français', locale: 'fr-FR' },
  { code: 'de', label: 'Deutsch', locale: 'de-DE' },
  { code: 'es', label: 'Español', locale: 'es-ES' },
  { code: 'it', label: 'Italiano', locale: 'it-IT' },
  { code: 'nl', label: 'Nederlands', locale: 'nl-NL' },
  { code: 'zh', label: '简体中文', locale: 'zh-CN' },
];

export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGE_CODES: string[] = LANGUAGES.map((l) => l.code);

const LOCALE_MAP: Record<string, string> = LANGUAGES.reduce(
  (acc, l) => {
    acc[l.code] = l.locale;
    return acc;
  },
  {} as Record<string, string>,
);

export function isSupportedLanguage(code: string | null | undefined): boolean {
  return !!code && LANGUAGE_CODES.includes(code);
}

/**
 * Pick a language from a stored preference, falling back to the browser language.
 * `browser` may be a full tag ("zh-CN", "fr-FR") — only the primary subtag is compared.
 */
export function resolveLanguage(
  saved?: string | null,
  browser?: string | null
): string {
  if (isSupportedLanguage(saved)) return saved as string;
  const primary = (browser || '').toLowerCase().slice(0, 2);
  if (isSupportedLanguage(primary)) return primary;
  return DEFAULT_LANGUAGE;
}

/** Full BCP-47 locale for a language code, e.g. "zh" -> "zh-CN" */
export function getLocale(language?: string | null): string {
  return (language && LOCALE_MAP[language]) || LOCALE_MAP[DEFAULT_LANGUAGE];
}
