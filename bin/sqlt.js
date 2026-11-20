#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, DB, HarnessError } from '../lib/config.js';
import { connect, resetDatabase, execScript, runQuery, describeSqlError, isBlank } from '../lib/db.js';
import { compareResults } from '../lib/compare.js';
import { renderTable, renderMarkdownTable, indent, c } from '../lib/format.js';
import { listProblemSlugs, resolveProblem, loadProblem, dbNameFor, loadState, saveResult } from '../lib/problems.js';

const rel = (p) => path.relative(ROOT, p);

const HELP = `
${c.bold('sqlt')} — MySQL practice harness

  ./sqlt.sh up                     Start the MySQL 8.0 container (port ${DB.port})
  ./sqlt.sh down                   Stop and remove it
  ./sqlt.sh list                   List problems and your progress

  ./sqlt.sh run   <problem>        Run your answer.sql against the seed data and print the result
        --watch                 Re-run every time answer.sql is saved
  ./sqlt.sh check <problem>        Grade answer.sql against the seed + hidden test datasets
        --watch                 Re-grade every time answer.sql is saved
        --verbose               Show expected/actual tables for every failure
  ./sqlt.sh shell <problem>        Open a mysql prompt with the seed data loaded (for exploring)

  run/check also take  --answer <file>  to use a different SQL file than the problem's answer.sql,
  and run takes  --data <test-name>  to run against a hidden dataset instead of the seed.

  ./sqlt.sh validate [problem]     (authoring) Check a problem's files + run its reference solution
  ./sqlt.sh sample <problem>       (authoring) Print seed tables + expected output as markdown for problem.md

<problem> can be the number (1), the full folder name, or any unique part of it (top-cust).
`;

// ---------------------------------------------------------------------------
// helpers

function requireAnswer(problem, flags = {}) {
  const file = flags.answer ? path.resolve(flags.answer) : problem.paths.answer;
  if (!fs.existsSync(file)) throw new HarnessError(`Answer file not found: ${file}`);
  const sql = fs.readFileSync(file, 'utf8');
  if (isBlank(sql)) {
    throw new HarnessError(`${rel(file)} has no SQL in it yet. Write your query there and try again.`);
  }
  return sql;
}

/** Fresh database with the schema + one dataset loaded. Returns an open connection USE-ing it. */
async function loadDataset(problem, dataset, dbName) {
  const conn = await connect();
  try {
    await resetDatabase(conn, dbName);
    await execScript(conn, problem.read(problem.paths.schema), rel(problem.paths.schema));
    await execScript(conn, problem.read(dataset.path), rel(dataset.path));
    return conn;
  } catch (err) {
    conn.destroy();
    throw err;
  }
}

async function timed(fn) {
  const t0 = performance.now();
  const value = await fn();
  return { value, ms: Math.round(performance.now() - t0) };
}

// ---------------------------------------------------------------------------
// commands

function cmdDocker(args) {
  const res = spawnSync('docker', ['compose', ...args], { cwd: ROOT, stdio: 'inherit' });
  if (res.error?.code === 'ENOENT') throw new HarnessError('docker not found on PATH.');
  if (res.status !== 0) {
    throw new HarnessError('docker compose failed (see output above). Is Docker Desktop running?');
  }
}

async function cmdUp() {
  console.log(c.dim('Starting MySQL 8.0 (first run downloads the image)...'));
  cmdDocker(['up', '-d', '--wait']);
  console.log(c.green(`MySQL is ready on ${DB.host}:${DB.port}.`) + ' Try:  ./sqlt.sh list');
}

function cmdList() {
  const state = loadState();
  const slugs = listProblemSlugs();
  if (!slugs.length) {
    console.log('No problems yet. Ask an agent to generate one (see CLAUDE.md).');
    return;
  }
  const rows = slugs.map((slug) => {
    const p = loadProblem(slug);
    const s = state[slug];
    const status = !s ? '-' : s.passed === s.total ? 'PASSED' : `${s.passed}/${s.total}`;
    return [slug, p.meta.title, p.meta.difficulty, status];
  });
  console.log(renderTable(['problem', 'title', 'difficulty', 'last check'], rows, { maxRows: 1000 }));
}

async function cmdRun(problem, flags) {
  const answer = requireAnswer(problem, flags);
  const dataset = flags.data
    ? problem.datasets.find((d) => d.name === flags.data || d.name.startsWith(flags.data))
    : problem.datasets[0];
  if (!dataset) throw new HarnessError(`No dataset named "${flags.data}".`);

  const conn = await loadDataset(problem, dataset, dbNameFor(problem));
  try {
    const { value: result, ms } = await timed(() => runQuery(conn, answer));
    console.log(renderTable(result.columns, result.rows, { maxRows: 200, title: c.dim(`${dataset.name} data · ${ms} ms`) }));
  } catch (err) {
    console.log(c.red(describeSqlError(err)));
    process.exitCode = 1;
  } finally {
    conn.destroy();
  }
}

async function gradeDataset(problem, dataset, answerSql, referenceSql) {
  const conn = await loadDataset(problem, dataset, dbNameFor(problem, 'grade'));
  try {
    let expected;
    try {
      expected = await runQuery(conn, referenceSql); // reference runs first, so a mutating answer can't affect it
    } catch (err) {
      throw new HarnessError(`Reference solution failed on dataset "${dataset.name}": ${describeSqlError(err)}`);
    }
    try {
      const { value: actual, ms } = await timed(() => runQuery(conn, answerSql));
      return { expected, actual, ms, cmp: compareResults(expected, actual, { ordered: problem.meta.ordered }) };
    } catch (err) {
      return { expected, error: describeSqlError(err) };
    }
  } finally {
    conn.destroy();
  }
}

function printFailure(r, verbose, previousMessages) {
  const messages = r.error ? [r.error] : r.cmp.problems;
  const key = messages.join('\n');
  // Same complaint as an earlier dataset with nothing data-specific to show? Don't repeat it.
  const nothingToShow = r.error || (r.cmp.missing.length === 0 && r.cmp.extra.length === 0 && r.cmp.firstMismatch === null);
  if (!verbose && nothingToShow && previousMessages.has(key)) {
    console.log(indent(c.dim('(same as above)'), 6));
    return;
  }
  previousMessages.add(key);

  if (r.error) {
    console.log(indent(c.red(r.error), 6));
    return;
  }
  for (const p of r.cmp.problems) console.log(indent(c.yellow(p), 6));
  if (r.cmp.problems.length === 1 && r.cmp.problems[0].startsWith('Column names')) {
    console.log(indent(c.dim('(the data itself is correct — just rename the columns with AS)'), 6));
  }

  const showBoth = verbose || r.cmp.firstMismatch !== null || r.expected.columns.length !== r.actual.columns.length;
  if (showBoth) {
    console.log(indent(renderTable(r.expected.columns, r.expected.rows, { title: c.cyan('expected:') }), 6));
    console.log(indent(renderTable(r.actual.columns, r.actual.rows, { title: c.cyan('yours:') }), 6));
    return;
  }
  if (r.cmp.missing.length) {
    console.log(indent(renderTable(r.expected.columns, r.cmp.missing, { title: c.cyan('missing (expected, but you did not return):') }), 6));
  }
  if (r.cmp.extra.length) {
    console.log(indent(renderTable(r.actual.columns, r.cmp.extra, { title: c.cyan('unexpected (you returned, but should not have):') }), 6));
  }
}

async function cmdCheck(problem, flags) {
  const answer = requireAnswer(problem, flags);
  const reference = problem.read(problem.paths.reference);

  console.log(c.bold(`${problem.slug}`) + c.dim(` — ${problem.meta.title}`) + c.dim(problem.meta.ordered ? '  (row order matters)' : '  (row order ignored)'));
  let passed = 0;
  const seenMessages = new Set();
  const labelFor = (ds) => (ds.hidden ? `test ${ds.name}` : 'seed data');
  const labelWidth = Math.max(...problem.datasets.map((ds) => labelFor(ds).length)) + 2;
  for (const ds of problem.datasets) {
    const r = await gradeDataset(problem, ds, answer, reference);
    const label = labelFor(ds).padEnd(labelWidth);
    if (!r.error && r.cmp.pass) {
      passed++;
      console.log(`  ${c.green('PASS')}  ${label}${c.dim(`${r.ms} ms`)}`);
    } else {
      console.log(`  ${c.red('FAIL')}  ${label}`);
      printFailure(r, flags.verbose, seenMessages);
    }
  }
  const total = problem.datasets.length;
  if (!flags.answer) saveResult(problem.slug, { passed, total });
  const summary = `${passed}/${total} datasets passed`;
  console.log('\n' + (passed === total ? c.green(c.bold(`All passed! ${summary}`)) : c.red(summary)));
  if (passed !== total) process.exitCode = 1;
}

/** Run `command` now and again every time the answer file is saved, until Ctrl+C. */
async function cmdWatch(command, problem, flags) {
  const file = flags.answer ? path.resolve(flags.answer) : problem.paths.answer;
  const runOnce = async () => {
    process.stdout.write('\x1Bc');
    console.log(c.dim(`[watching ${rel(file)} — Ctrl+C to stop]  ${new Date().toLocaleTimeString()}\n`));
    try {
      await command(loadProblem(problem.slug), flags);
    } catch (err) {
      console.log(c.red(describeSqlError(err)));
    }
    process.exitCode = 0;
  };
  await runOnce();
  let timer;
  fs.watch(path.dirname(file), (_event, filename) => {
    if (filename !== path.basename(file)) return;
    clearTimeout(timer);
    timer = setTimeout(runOnce, 200);
  });
  await new Promise(() => {}); // run until Ctrl+C
}

async function cmdShell(problem) {
  const dbName = dbNameFor(problem);
  const conn = await loadDataset(problem, problem.datasets[0], dbName);
  conn.destroy();
  console.log(c.dim(`Seed data loaded into database "${dbName}". Type \\q or exit to leave.\n`));
  spawnSync('docker', ['compose', 'exec', '-e', `MYSQL_PWD=${DB.password}`, 'mysql', 'mysql', '-uroot', dbName], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

/** (authoring) Print the seed tables + reference output on seed as markdown, for problem.md. */
async function cmdSample(problem) {
  const conn = await loadDataset(problem, problem.datasets[0], dbNameFor(problem, 'sample'));
  try {
    const [tables] = await conn.query('SHOW TABLES');
    for (const [table] of tables) {
      const [rows, fields] = await conn.query(`SELECT * FROM \`${table}\` ORDER BY 1`);
      console.log(`**${table}**\n\n${renderMarkdownTable(fields.map((f) => f.name), rows)}\n`);
    }
    const out = await runQuery(conn, problem.read(problem.paths.reference));
    console.log(`**Expected output**\n\n${renderMarkdownTable(out.columns, out.rows)}`);
  } finally {
    conn.destroy();
  }
}

async function validateOne(problem) {
  const errors = [];
  const warnings = [];
  for (const [name, p] of Object.entries(problem.paths)) {
    if (!fs.existsSync(p)) errors.push(`missing ${rel(p)} (${name})`);
  }
  if (!problem.meta.title) errors.push('meta.json needs a "title"');
  if (typeof problem.meta.ordered !== 'boolean') errors.push('meta.json needs "ordered": true|false');
  const hidden = problem.datasets.filter((d) => d.hidden);
  if (hidden.length < 3) warnings.push(`only ${hidden.length} hidden test dataset(s); aim for 4-6 edge cases`);
  if (fs.existsSync(problem.paths.answer) && !isBlank(problem.read(problem.paths.answer))) {
    warnings.push('answer.sql contains SQL — the starter should be comments only (ignore if you have been solving it)');
  }

  const outputs = [];
  if (!errors.length) {
    const reference = problem.read(problem.paths.reference);
    for (const ds of problem.datasets) {
      try {
        const conn = await loadDataset(problem, ds, dbNameFor(problem, 'validate'));
        try {
          const res = await runQuery(conn, reference);
          outputs.push({ ds, res });
        } finally {
          conn.destroy();
        }
      } catch (err) {
        errors.push(`${ds.name}: ${describeSqlError(err)}`);
      }
    }
  }

  console.log(c.bold(problem.slug) + c.dim(` — ${problem.meta.title}`));
  for (const { ds, res } of outputs) {
    console.log(`  ${ds.name.padEnd(36)} reference returns ${res.rows.length} row(s)`);
  }
  const seedOut = outputs.find((o) => o.ds.name === 'seed');
  if (seedOut && seedOut.res.rows.length === 0) warnings.push('reference returns 0 rows on the seed data — the example output should not be empty');
  if (outputs.length > 2) {
    const sig = (o) => JSON.stringify(o.res);
    const distinct = new Set(outputs.map(sig)).size;
    if (distinct < outputs.length) warnings.push(`${outputs.length - distinct} dataset(s) produce output identical to another dataset — make sure each test exercises something`);
  }
  if (seedOut) console.log('\n' + indent(renderTable(seedOut.res.columns, seedOut.res.rows, { title: c.cyan('reference output on seed (use as the example in problem.md):'), maxRows: 100 }), 2));

  for (const w of warnings) console.log(c.yellow(`  warning: ${w}`));
  for (const e of errors) console.log(c.red(`  error: ${e}`));
  console.log(errors.length ? c.red('  INVALID\n') : c.green('  OK\n'));
  return errors.length === 0;
}

async function cmdValidate(arg) {
  const problems = arg ? [resolveProblem(arg)] : listProblemSlugs().map(loadProblem);
  let ok = true;
  for (const p of problems) ok = (await validateOne(p)) && ok;
  if (!ok) process.exitCode = 1;
}

// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--watch' || a === '-w') flags.watch = true;
    else if (a === '--verbose' || a === '-v') flags.verbose = true;
    else if (a === '--data') flags.data = argv[++i];
    else if (a === '--answer') flags.answer = argv[++i];
    else if (a === '-h' || a === '--help') flags.help = true;
    else positional.push(a);
  }
  const [cmd, arg] = positional;

  switch (cmd) {
    case 'up':
      return cmdUp();
    case 'down':
      return cmdDocker(['down']);
    case 'list':
    case 'ls':
      return cmdList();
    case 'run':
    case 'check':
    case 'test': {
      const command = cmd === 'run' ? cmdRun : cmdCheck;
      const problem = resolveProblem(arg);
      return flags.watch ? cmdWatch(command, problem, flags) : command(problem, flags);
    }
    case 'shell':
      return cmdShell(resolveProblem(arg));
    case 'sample':
      return cmdSample(resolveProblem(arg));
    case 'validate':
      return cmdValidate(arg);
    default:
      console.log(HELP);
      if (cmd && !flags.help) {
        console.log(c.red(`Unknown command "${cmd}".`));
        process.exitCode = 1;
      }
  }
}

main().catch((err) => {
  console.error(c.red(describeSqlError(err)));
  if (!(err instanceof HarnessError) && process.env.DEBUG) console.error(err);
  process.exitCode = 1;
});
