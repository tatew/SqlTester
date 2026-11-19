// Result comparison. Values are canonicalised so that formatting differences that don't
// matter (2.50 vs 2.5000, 3 vs '3') compare equal, while real differences (2.33 vs 2.3333) don't.

const NUMERIC = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

function canonNumber(n) {
  const r = Math.round(n * 1e4) / 1e4;
  return Object.is(r, -0) ? '0' : String(r);
}

export function canon(v) {
  if (v === null || v === undefined) return null;
  if (Buffer.isBuffer(v)) v = v.toString('utf8');
  if (typeof v === 'number' || typeof v === 'bigint') return canonNumber(Number(v));
  if (typeof v === 'string' && NUMERIC.test(v.trim())) return canonNumber(Number(v));
  return String(v);
}

const rowKey = (row) => JSON.stringify(row.map(canon));

function multisetDiff(expectedRows, actualRows) {
  const counts = new Map();
  for (const r of expectedRows) {
    const k = rowKey(r);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const extra = [];
  for (const r of actualRows) {
    const k = rowKey(r);
    const c = counts.get(k) || 0;
    if (c > 0) counts.set(k, c - 1);
    else extra.push(r);
  }
  const missing = [];
  const remaining = new Map(counts);
  for (const r of expectedRows) {
    const k = rowKey(r);
    const c = remaining.get(k) || 0;
    if (c > 0) {
      missing.push(r);
      remaining.set(k, c - 1);
    }
  }
  return { missing, extra };
}

/**
 * Compare two result sets.
 * Returns { pass, problems: string[], missing, extra, firstMismatch }.
 */
export function compareResults(expected, actual, { ordered }) {
  const problems = [];
  let missing = [];
  let extra = [];
  let firstMismatch = null;

  if (expected.columns.length !== actual.columns.length) {
    problems.push(
      `Expected ${expected.columns.length} column(s) [${expected.columns.join(', ')}], got ${actual.columns.length} [${actual.columns.join(', ')}].`,
    );
    return { pass: false, problems, missing: expected.rows, extra: actual.rows, firstMismatch };
  }

  const names = (cols) => cols.map((c) => c.toLowerCase());
  if (names(expected.columns).join('\u0000') !== names(actual.columns).join('\u0000')) {
    problems.push(`Column names differ: expected [${expected.columns.join(', ')}], got [${actual.columns.join(', ')}].`);
  }

  ({ missing, extra } = multisetDiff(expected.rows, actual.rows));
  const sameRows = missing.length === 0 && extra.length === 0;

  if (!sameRows) {
    problems.push(
      `Rows differ: expected ${expected.rows.length} row(s), got ${actual.rows.length}` +
        ` (${missing.length} missing, ${extra.length} unexpected).`,
    );
  } else if (ordered) {
    const idx = expected.rows.findIndex((r, i) => rowKey(r) !== rowKey(actual.rows[i]));
    if (idx !== -1) {
      firstMismatch = idx;
      problems.push(`Right rows, wrong order (first difference at row ${idx + 1}). Check your ORDER BY.`);
    }
  }

  return { pass: problems.length === 0, problems, missing, extra, firstMismatch };
}
