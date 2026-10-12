/**
 * Single source of truth for the product brand (server side).
 *
 * Mirrors client/src/brand.ts — keep the two in sync.
 */
export const BRAND_NAME = '家务小当家';

/**
 * ASCII-only technical root, used exclusively for identifiers that cannot
 * contain non-ASCII characters (db filename, backup filename, notification titles).
 * Never return this to the API consumer for display.
 */
export const TECH_ROOT = 'jiawu';

/** SQLite database filename (stored in data/). */
export const DB_FILENAME = `${TECH_ROOT}.db`;

/** Backup file name sent in Content-Disposition on data export. */
export const BACKUP_FILENAME = `${TECH_ROOT}-backup.json`;

/** Achievement id prefix — keep in sync with utils/achievements.ts ids. */
export const ACHIEVEMENT_LEGEND_ID = `${TECH_ROOT}_legend_250`;
