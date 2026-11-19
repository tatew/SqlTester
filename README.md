# SqlTester — MySQL interview practice

Write a query, then grade it against the visible example data **and** a set of hidden edge-case datasets,
all on a real MySQL 8.0 server in Docker.

## Quick start

```bash
npm install                # once
./sqlt.sh up               # start MySQL 8.0 in Docker (port 3307)
./sqlt.sh list             # see the problems

# open problems/001-top-customers/problem.md, write your query in answer.sql, then:
./sqlt.sh check 1 --watch  # re-grades every time you save answer.sql
```

When you're done for the day: `./sqlt.sh down`.

## Commands

| command | what it does |
|---|---|
| `./sqlt.sh up` / `./sqlt.sh down` | start / stop the MySQL container |
| `./sqlt.sh list` | all problems + your last result on each |
| `./sqlt.sh run 1` | run your `answer.sql` on the seed data and print the result (no grading) |
| `./sqlt.sh check 1` | grade `answer.sql` on the seed + hidden datasets (`--watch`, `--verbose`) |
| `./sqlt.sh shell 1` | `mysql>` prompt with the seed data loaded, for exploring |
| `./sqlt.sh validate [1]` | *(authoring)* sanity-check a problem and run its reference solution |
| `./sqlt.sh sample 1` | *(authoring)* seed tables + expected output as Markdown |

You can refer to a problem by number (`1`), full folder name, or any unique part of it (`top-cust`).
`run` and `check` also take `--answer some.sql` to grade a different file.

## A problem folder

```
problems/001-top-customers/
  problem.md               ← the prompt: read this
  answer.sql               ← write your query here
  schema.sql, seed.sql     ← table definitions + the example data
  tests/*.sql              ← hidden datasets (spoilers: each one targets a common mistake)
  solution/reference.sql   ← the answer (spoilers)
  meta.json
```

## How grading works

For each dataset the harness creates a fresh database, loads `schema.sql` plus the dataset, runs the
reference solution, runs your answer, and compares the results:

- **Column count and names** must match (names are case-insensitive), so alias with `AS` as the prompt asks.
- **Values** must match. Numbers are compared at 4 decimal places, so `2.5` = `2.50`, but `2.33` ≠ `2.3333`.
- **Row order** is checked when the problem specifies an ORDER BY (it shows `row order matters`).
- If your file has several statements (`SET @x = ...; SELECT ...`), the last result set is graded.
- Queries time out after 10 s.

When something fails, you see the missing and unexpected rows, or expected vs. yours side by side.

## Getting new problems

Ask Claude Code in this folder for a new problem, e.g. *"give me a new medium SQL problem about window functions"*,
or run `/new-sql-problem medium window functions`. The `new-sql-problem` skill defines the format and has
the agent verify the hidden tests actually catch the mistakes they target, without spoiling the
answer for you.

## Troubleshooting

- **`Can't reach MySQL`** → `./sqlt.sh up` (and make sure Docker Desktop is running).
- **Port 3307 already in use** → `SQLT_PORT=3310 ./sqlt.sh up`, and prefix the other commands the same way.
- **`unauthorized: ...` when pulling `mysql:8.0`** → fix your Docker Hub login in Docker Desktop, or use AWS's
  mirror of the same official image: `SQLT_IMAGE=public.ecr.aws/docker/library/mysql:8.0 ./sqlt.sh up`.
