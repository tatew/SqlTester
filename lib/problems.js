import fs from 'node:fs';
import path from 'node:path';
import { PROBLEMS_DIR, STATE_FILE, HarnessError } from './config.js';

const read = (p) => fs.readFileSync(p, 'utf8');

export function listProblemSlugs() {
  if (!fs.existsSync(PROBLEMS_DIR)) return [];
  return fs
    .readdirSync(PROBLEMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(PROBLEMS_DIR, d.name, 'meta.json')))
    .map((d) => d.name)
    .sort();
}

/** Accepts a full slug ("001-top-customers"), a number ("1"), or any unique substring ("top"). */
export function resolveProblem(arg) {
  const slugs = listProblemSlugs();
  if (!arg) throw new HarnessError('Which problem? Pass a number or name, e.g.  ./sqlt.sh check 1   (see ./sqlt.sh list)');
  if (slugs.includes(arg)) return loadProblem(arg);

  if (/^\d+$/.test(arg)) {
    const hit = slugs.find((s) => parseInt(s, 10) === parseInt(arg, 10));
    if (hit) return loadProblem(hit);
  }
  const hits = slugs.filter((s) => s.toLowerCase().includes(arg.toLowerCase()));
  if (hits.length === 1) return loadProblem(hits[0]);
  if (hits.length > 1) throw new HarnessError(`"${arg}" matches several problems: ${hits.join(', ')}`);
  throw new HarnessError(`No problem matches "${arg}". Run  ./sqlt.sh list  to see them.`);
}

export function loadProblem(slug) {
  const dir = path.join(PROBLEMS_DIR, slug);
  const file = (name) => path.join(dir, name);
  const meta = JSON.parse(read(file('meta.json')));

  const testsDir = file('tests');
  const hiddenTests = fs.existsSync(testsDir)
    ? fs
        .readdirSync(testsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .map((f) => ({ name: f.replace(/\.sql$/, ''), path: path.join(testsDir, f), hidden: true }))
    : [];

  return {
    slug,
    dir,
    meta: { ordered: true, difficulty: 'unknown', topics: [], ...meta },
    paths: {
      problem: file('problem.md'),
      schema: file('schema.sql'),
      seed: file('seed.sql'),
      answer: file('answer.sql'),
      reference: path.join(dir, 'solution', 'reference.sql'),
    },
    datasets: [{ name: 'seed', path: file('seed.sql'), hidden: false }, ...hiddenTests],
    read: (p) => read(p),
  };
}

/** A safe, short MySQL database name for a problem. */
export function dbNameFor(problem, suffix = '') {
  const base = problem.slug.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
  return `p_${base}${suffix ? '_' + suffix : ''}`;
}

// --- tiny persisted progress (last check result per problem) ---
export function loadState() {
  try {
    return JSON.parse(read(STATE_FILE));
  } catch {
    return {};
  }
}

export function saveResult(slug, result) {
  const state = loadState();
  state[slug] = { ...result, at: new Date().toISOString() };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
