import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PROBLEMS_DIR = path.join(ROOT, 'problems');
export const STATE_FILE = path.join(ROOT, '.sqlt', 'state.json');

export const DB = {
  host: process.env.SQLT_HOST || '127.0.0.1',
  port: Number(process.env.SQLT_PORT || 3307),
  user: 'root',
  password: process.env.SQLT_PASSWORD || 'practice',
};

// Max time a single answer query may run before it is treated as a failure.
export const QUERY_TIMEOUT_MS = Number(process.env.SQLT_TIMEOUT_MS || 10_000);

export class HarnessError extends Error {}
