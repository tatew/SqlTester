const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));

export const c = {
  green: wrap(32),
  red: wrap(31),
  yellow: wrap(33),
  cyan: wrap(36),
  dim: wrap(2),
  bold: wrap(1),
};

function cell(v) {
  if (v === null || v === undefined) return 'NULL';
  if (Buffer.isBuffer(v)) return v.toString('utf8');
  return String(v);
}

/** Render rows like the mysql CLI does. */
export function renderTable(columns, rows, { maxRows = 25, title } = {}) {
  const shown = rows.slice(0, maxRows).map((r) => r.map(cell));
  const widths = columns.map((col, i) => Math.max(String(col).length, ...shown.map((r) => r[i].length)));
  const line = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
  const fmt = (vals) => '| ' + vals.map((v, i) => String(v).padEnd(widths[i])).join(' | ') + ' |';

  const out = [];
  if (title) out.push(title);
  if (columns.length === 0) return out.concat('(no columns)').join('\n');
  out.push(line, fmt(columns), line);
  for (const r of shown) out.push(fmt(r));
  if (shown.length) out.push(line);
  if (rows.length > maxRows) out.push(c.dim(`... ${rows.length - maxRows} more row(s) not shown`));
  out.push(c.dim(`${rows.length} row${rows.length === 1 ? '' : 's'}`));
  return out.join('\n');
}

export function indent(text, n = 4) {
  const pad = ' '.repeat(n);
  return text
    .split('\n')
    .map((l) => pad + l)
    .join('\n');
}

/** Render rows as a GitHub-flavoured markdown table (for problem.md). */
export function renderMarkdownTable(columns, rows) {
  const esc = (v) => cell(v).replace(/\|/g, '\\|');
  const out = ['| ' + columns.join(' | ') + ' |', '|' + columns.map(() => '---').join('|') + '|'];
  for (const r of rows) out.push('| ' + r.map(esc).join(' | ') + ' |');
  if (!rows.length) out.push('| ' + columns.map(() => ' ').join(' | ') + ' |');
  return out.join('\n');
}
