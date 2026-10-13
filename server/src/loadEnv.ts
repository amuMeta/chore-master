import fs from 'fs';
import path from 'path';

/**
 * Loads <repo-root>/.env into process.env so that `npm run dev` works the same
 * in PowerShell, Git Bash and CMD — none of which share the POSIX
 * `VAR=value cmd` syntax.
 *
 * IMPORTANT: must be imported before anything else. Several modules read
 * process.env at module scope (e.g. middleware/auth.ts captures JWT_SECRET
 * at import time), so a late import silently has no effect.
 *
 * Precedence: real environment variables (shell exports, Docker env_file, CI
 * secrets) always win over the file. `process.loadEnvFile()` overwrites, so we
 * snapshot first and restore afterwards.
 */
function loadRootEnv(): void {
  // Tests provide their own secrets in src/test/setup.ts.
  if (process.env.VITEST !== undefined || process.env.NODE_ENV === 'test') return;

  // Build: <repo>/server/dist  ·  Dev: <repo>/server/src  → both resolve to <repo>/.env
  const envPath = path.resolve(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const inherited = { ...process.env };
  process.loadEnvFile(envPath);
  for (const key of Object.keys(inherited)) {
    process.env[key] = inherited[key] as string;
  }
}

try {
  loadRootEnv();
} catch (err) {
  console.warn('[loadEnv] Skipped .env:', (err as Error).message);
}
