/**
 * Single source of truth for the product brand.
 *
 * Change these two values to rebrand the entire app — nothing else should
 * hardcode the brand name or the technical root.
 */
export const BRAND = {
  /** Display name shown in the UI. Used across all locales (brand names aren't translated). */
  name: '家务小当家',

  /**
   * ASCII-only technical root, used exclusively for identifiers that cannot
   * contain non-ASCII characters: database filename, localStorage keys,
   * backup filename, Docker image/service names, Home Assistant domain.
   * Never render this into the UI.
   */
  techRoot: 'jiawu',
} as const;

/** Backup file name offered to the user on data export. */
export const BACKUP_FILENAME = `${BRAND.techRoot}-backup.json`;
