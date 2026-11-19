# SqlTester

A local MySQL 8.0 practice harness for a take-home SQL interview question. The user writes a query in
`problems/<NNN-slug>/answer.sql`, and `./sqlt.sh check <N>` grades it against the seed data plus hidden
edge-case datasets, by comparing it with `solution/reference.sql`.

- **New problem requested?** Use the `new-sql-problem` skill (`.claude/skills/new-sql-problem/SKILL.md`).
  It defines the folder format, the quality bar, and the required verification steps.
- **Never spoil a problem.** Unless the user asks, don't show or hint at `solution/reference.sql`
  or the contents of `tests/`. When reviewing the user's answer, give hints before giving solutions.
- Don't edit the user's `answer.sql` unless asked. To try queries yourself, write them in the scratchpad
  and use `./sqlt.sh check N --answer <file>`.
- The helper code is Node.js (ESM, no build step) using `mysql2`. **Don't add Python.**
  - `bin/sqlt.js` CLI · `lib/db.js` connection/query running · `lib/compare.js` result comparison ·
    `lib/problems.js` problem discovery · `lib/format.js` table output
- MySQL runs via `docker-compose.yml` on port 3307 (`SQLT_PORT` overrides it), root password `practice`,
  data in tmpfs. The image is the official `mysql:8.0` (`SQLT_IMAGE` overrides it). The entry point is `./sqlt.sh`.
