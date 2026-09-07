import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

// Resolve to the repo root .env regardless of the process cwd (npm
// workspaces run scripts with cwd set to apps/api, not the repo root).
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

export const env = z
  .object({
    JWT_SECRET: z.string().min(20),
    PORT: z.coerce.number().default(4000),
    CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
    DATABASE_PATH: z.string().default('./data/cwros.db')
  })
  .parse(process.env);
