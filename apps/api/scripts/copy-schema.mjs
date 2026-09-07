import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
copyFileSync(resolve(root, 'src/schema.sql'), resolve(root, 'dist/schema.sql'));
