---
name: new-sql-problem
description: Generate a new MySQL practice problem for this harness (prompt, schema, seed data, hidden edge-case tests, reference solution), then verify it. Use when the user asks for a new SQL problem/question/exercise to practice. Optional args - difficulty and/or topic, e.g. "medium window functions".
---

# Generate a new SQL practice problem

The user is preparing for a take-home interview with a MySQL question ("here are some tables, write a
query to answer X"). Each problem you add is a self-contained folder that `./sqlt.sh` grades
automatically. **The user is going to solve it, so don't spoil it** (see "Handing it over").

## 1. Pick the problem

- Run `./sqlt.sh list` and read the `meta.json` files under `problems/` to see what exists (titles + `topics`).
  Choose something that **doesn't repeat** existing topics or scenarios unless the user asked for it.
- Honor any difficulty/topic in the args. Default: **easy–medium**, since the real test checks for
  baseline competency.
  - easy: 1–2 tables; WHERE, JOIN, GROUP BY / HAVING, ORDER BY, simple aggregates.
  - medium: 2–3 tables; LEFT JOIN + "zero" rows (COALESCE), subqueries / CTEs, CASE, date functions,
    window functions (ROW_NUMBER / RANK / LAG / running totals), ties, NULL handling.
  - hard: multi-step CTEs, gaps-and-islands, retention, self-joins, top-N per group with tricky ties.
- Use a realistic business scenario (orders, subscriptions, support tickets, rides, inventory, ...).
- It must have **one unambiguous correct answer**, and you must be able to write it in MySQL 8.0.
  MySQL 8 features (CTEs, window functions) are fine. The server runs with the default
  `ONLY_FULL_GROUP_BY` mode.

## 2. Folder layout

Use the next 3-digit number: `problems/NNN-short-kebab-slug/`

```
problems/NNN-slug/
  meta.json              {"title", "difficulty", "ordered", "topics"}
  problem.md             the prompt the user reads
  schema.sql             CREATE TABLE statements only
  seed.sql               INSERTs for the visible example data
  answer.sql             starter file the user writes in (comments only, no SQL!)
  tests/NN-what-it-checks.sql   hidden datasets: each is a COMPLETE, standalone set of INSERTs
  solution/reference.sql the reference query (one SELECT, which can use WITH)
  solution/explanation.md why the reference works (spoilers are fine here)
```

The harness loads `schema.sql` + one dataset into a fresh database and runs both the reference and the
user's answer against it, then compares the results. Copy the format from an existing problem
(e.g. `problems/001-top-customers/`).

### meta.json

```json
{ "title": "Top Customers of 2024", "difficulty": "easy", "ordered": true, "topics": ["JOIN", "GROUP BY", "HAVING"] }
```

`ordered: true` means row order is graded, so the prompt **must** specify a complete ORDER BY,
including tie-breaks, and the reference must sort by exactly that. Prefer `ordered: true` with an explicit
sort plus tie-break, the way most interview prompts do. Use `false` only if the prompt says "any order".

### schema.sql

- Real constraints: `PRIMARY KEY`, `NOT NULL`, `FOREIGN KEY`. Mark nullable columns explicitly and say
  in a comment what NULL means.
- Money is `DECIMAL(10,2)`, never FLOAT. Timestamps are `DATETIME` when time-of-day matters, which
  makes for a great date-range trap.
- Every dataset must INSERT parents before children (FKs are enforced).

### Output must be deterministic

The grader compares column count, column **names** (case-insensitive) and values. So the prompt must state:
- the exact output column names, in order (put them in a table in problem.md);
- the sort order and tie-breaks (when `ordered: true`);
- rounding for any division or average, e.g. "rounded to 2 decimal places". Numbers are compared at
  4 decimal places, and `2.5` equals `2.50`;
- how to treat NULLs, ties, empty groups, and inclusive/exclusive boundaries, wherever any of those matter.

If two reasonable readings of the prompt give different results on any dataset, reword the prompt.

### seed.sql (the visible example)

- About 5–20 rows per table. The expected output must be **non-empty** and should show the main
  nuance (e.g. a tie that shows the tie-break), but it shouldn't reveal every trap.

### tests/ (the hidden datasets)

- Write 4–6 files, named `01-short-description.sql`, `02-...`. Each starts with a `--` comment that says
  which mistake it targets.
- Each one should exist to catch a **specific, plausible mistake**, for example:
  - BETWEEN / `<= 'YYYY-12-31'` on a DATETIME, or off-by-one date boundaries
  - INNER JOIN where a LEFT JOIN is needed (entities with zero rows), and COUNT(*) vs COUNT(col)
  - grouping by a name that isn't unique (two people with the same name)
  - ties: LIMIT 1 / ROW_NUMBER where all tied rows should be returned (or the reverse)
  - NULLs in join keys or values, and `NOT IN` with NULLs
  - a correlated condition written uncorrelated (`IN (SELECT MAX(...) GROUP BY ...)`)
  - filtering in WHERE vs HAVING, or a filter applied to only part of the calculation
  - sorting by an id instead of a name, or a missing tie-break
  - an empty result (nothing qualifies) and empty tables
- Within each file, design the data so that the plausible mistake gives a **different result** than the correct query.

### problem.md

Structure: `# NNN · Title`, a difficulty/suggested-time line, the business question, rules/clarifications,
`## Schema` (the CREATE TABLEs, FKs shown as comments are fine), `## Output` (a table of columns + the sort
order), `## Example` (the seed tables + expected output), and finally the line
"Your query will also be run against several hidden datasets that use the same schema.", followed by
a `## Hints` section (format below).

**Don't** hint at the solution technique, and don't describe the hidden tests. You may (and should) state
rules that a careful reader needs, like "ties: return all", "ignore unassigned employees".

#### Hints (required)

End problem.md with exactly 3 hints, each in a collapsed `<details>` block so it stays hidden until
the user opens it. Leave blank lines inside the block so the Markdown in it renders:

```markdown
## Hints

Each hint gives away a little more than the one before it. Try the problem before you open them.

<details>
<summary>Hint 1</summary>

...

</details>
```

Each hint should give away more than the one before it:
1. **Nudge**: how to break the problem into steps, or which kind of clause or concept matters. No syntax.
2. **The main pitfall**: point at the most important trap (e.g. DATETIME boundaries, ties, NULLs) without
   writing the fix in full.
3. **The shape**: outline the query structure, or name the approaches that work, without being a
   copy-pasteable answer.

Hints may point at traps in general terms, but must not describe the hidden test datasets.

Generate the Example section; don't hand-write it: `./sqlt.sh sample NNN` prints the seed tables and the
reference output as Markdown.

### answer.sql starter

```sql
-- NNN · Title — the prompt is in problem.md
-- Write your query below, then:   ./sqlt.sh check N     (or ./sqlt.sh check N --watch)
-- Just see your output:           ./sqlt.sh run N
-- Poke at the data:               ./sqlt.sh shell N

```

### solution/explanation.md

Explains why the reference solution works, for when the user has finished the problem or given up. Copy
the structure from an existing problem (e.g. `problems/002-department-top-earners/solution/explanation.md`):
- `# NNN · Title: why the solution works`, then the reference query in a `sql` block.
- **How it works**: go through the clauses in order (in the order MySQL evaluates them, when that
  helps) and say why each one is needed.
- **The traps**: a table with columns *Trap · What goes wrong · Why the reference is safe*, with one
  row for each hidden test's mistake (plus any other common mistakes).
- **Other correct ways to write it**: 1–2 alternatives in a different style (the one you write in
  verification step 3 is a good choice), with a note on the trade-offs.

## 3. Verify (required)

1. MySQL must be running: `./sqlt.sh up` (it doesn't hurt if it's already up).
2. `./sqlt.sh validate NNN` must print **OK** with no warnings, except the "answer.sql contains SQL" one.
3. Write an **alternative correct solution** in a different style (e.g. a window function instead of a
   subquery) in the scratchpad, and check that `./sqlt.sh check NNN --answer <that file>` passes every
   dataset. If it doesn't, the prompt is ambiguous or the reference is wrong: fix it.
4. For **each** hidden test, write the plausible wrong query it targets in the scratchpad and confirm
   `./sqlt.sh check NNN --answer <file>` fails that test. If nothing fails a test, change its data or drop it.
5. Make sure `problems/NNN-slug/answer.sql` contains only the starter comments.
6. If `explanation.md` includes alternative queries, check each one with `--answer` like in step 3.

`--answer` runs don't record progress, so verifying doesn't touch the user's `./sqlt.sh list` status.

## 4. Handing it over

Tell the user only the problem number, title, difficulty, and how to start (`open problem.md`,
`./sqlt.sh check N --watch`). **Do not** show the reference solution, the hidden test contents, or which
traps you planted. Mention that the solution is in `solution/reference.sql` (with `solution/explanation.md`) for when they
want it, and that problem.md ends with collapsed hints.
