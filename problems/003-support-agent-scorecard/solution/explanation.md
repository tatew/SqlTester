# 003 · Support Agent Scorecard: why the solution works

```sql
SELECT
  a.agent_id,
  a.name,
  COUNT(t.ticket_id)   AS tickets_assigned,
  COUNT(t.resolved_at) AS tickets_resolved,
  SUM(CASE WHEN t.priority = 'urgent' AND t.resolved_at IS NULL THEN 1 ELSE 0 END) AS open_urgent,
  ROUND(100 * COUNT(t.resolved_at) / NULLIF(COUNT(t.ticket_id), 0), 1) AS resolution_pct
FROM agents AS a
LEFT JOIN tickets AS t
  ON  t.agent_id = a.agent_id
  AND t.created_at >= '2024-10-01'
  AND t.created_at <  '2024-11-01'
WHERE a.is_active = 1
GROUP BY a.agent_id, a.name
ORDER BY tickets_assigned DESC, a.agent_id ASC;
```

## How it works

1. **`FROM agents LEFT JOIN tickets ON ...`**: every agent produces at least one row. An agent with
   matching tickets gets one row per ticket. An agent with none gets a single row whose `t.*` columns
   are all `NULL`.
   - The **October filter is in `ON`**, so it decides which tickets attach to the agent, not which
     agents survive. Tickets from September or November don't match, and the agent still gets
     its all-`NULL` row.
   - October is written as `>= '2024-10-01' AND < '2024-11-01'`. Because `created_at` is a `DATETIME`,
     this includes everything up to `2024-10-31 23:59:59` and excludes midnight on Nov 1.
   - Unassigned tickets (`agent_id IS NULL`) never match `t.agent_id = a.agent_id`, so they're ignored.
2. **`WHERE a.is_active = 1`**: this is a condition on the *agent*, so it belongs in `WHERE`, which
   removes inactive agents completely. (In `ON` it would only stop their tickets from matching, and
   they'd show up with zeros.)
3. **`GROUP BY a.agent_id, a.name`**: one row per agent. Listing `name` too keeps
   `ONLY_FULL_GROUP_BY` happy (MySQL would also accept just the primary key).
4. **The counts**:
   - `COUNT(t.ticket_id)` counts only non-`NULL` values, so the all-`NULL` row of an agent with no
     tickets counts as **0**. `COUNT(*)` would count that row as 1.
   - `COUNT(t.resolved_at)` counts resolved tickets, whenever they were resolved.
   - `SUM(CASE WHEN urgent AND open THEN 1 ELSE 0 END)` counts tickets that meet *both* conditions. For
     the all-`NULL` row the condition isn't true, so `ELSE 0` adds 0 and the sum is 0, not `NULL`.
5. **`resolution_pct`**: `NULLIF(count, 0)` turns a zero denominator into `NULL`, and dividing by
   `NULL` gives `NULL`, which is what the prompt asks for. (MySQL's default mode already returns `NULL`
   for division by zero, but `NULLIF` makes the intent explicit.) `ROUND(..., 1)` rounds to one
   decimal place.
6. **`ORDER BY tickets_assigned DESC, a.agent_id ASC`**: the required sort plus the tie-break.

## The traps

| Trap | What goes wrong | Why the reference is safe |
|---|---|---|
| `INNER JOIN` instead of `LEFT JOIN` | Agents with no October tickets vanish. | The `LEFT JOIN` keeps every agent. |
| `COUNT(*)` after the `LEFT JOIN` | An agent with no tickets shows `tickets_assigned = 1` (and 0.0 instead of `NULL` for the percentage). | `COUNT(t.ticket_id)` ignores the `NULL` row. |
| Date filter in `WHERE` after a `LEFT JOIN` | `t.created_at >= ...` is never true for the all-`NULL` row, so agents whose tickets are all from other months disappear: the outer join quietly becomes an inner join. | The date filter is part of the `ON` clause. |
| `BETWEEN '2024-10-01' AND '2024-10-31'` or `<= '2024-11-01'` | The first drops everything after midnight on Oct 31. The second picks up tickets created at exactly midnight on Nov 1. | Half-open range: `>= Oct 1 AND < Nov 1`. |
| `open_urgent` with only one condition | Counting every urgent ticket includes resolved ones. Counting every open ticket includes non-urgent ones. | The `CASE` checks `priority = 'urgent' AND resolved_at IS NULL`. |
| Only counting resolutions made in October | A ticket created Oct 30 and resolved Nov 2 is resolved, but gets left out. | `COUNT(t.resolved_at)` doesn't look at the resolution date. |
| `is_active = 1` in the `ON` clause, or missing | Inactive agents appear, with zeros or with their real counts. | The filter is in `WHERE`, on the agents table. |
| `SUM(CASE WHEN ... THEN 1 END)` without `ELSE 0` | The sum for an agent with no matching tickets is `NULL` instead of 0. | `ELSE 0`. |
| Joining to pre-aggregated counts without `COALESCE` | Agents with no row in the subquery get `NULL` counts. | No pre-aggregation in the reference. See the alternative below for the `COALESCE` version. |
| No `GROUP BY` | Aggregating with no `GROUP BY` returns one row even when there are no agents. | One group per agent, so no agents means no rows. |

## Other correct ways to write it

**Aggregate the tickets first, then join** (needs `COALESCE`, because agents without a match get `NULL`s):

```sql
WITH oct AS (
  SELECT agent_id,
         COUNT(*)                                          AS n,
         SUM(resolved_at IS NOT NULL)                      AS r,
         SUM(priority = 'urgent' AND resolved_at IS NULL)  AS u
  FROM tickets
  WHERE created_at >= '2024-10-01' AND created_at < '2024-11-01'
    AND agent_id IS NOT NULL
  GROUP BY agent_id
)
SELECT a.agent_id, a.name,
       COALESCE(o.n, 0) AS tickets_assigned,
       COALESCE(o.r, 0) AS tickets_resolved,
       COALESCE(o.u, 0) AS open_urgent,
       ROUND(o.r * 100.0 / o.n, 1) AS resolution_pct
FROM agents AS a
LEFT JOIN oct AS o ON o.agent_id = a.agent_id
WHERE a.is_active = 1
ORDER BY tickets_assigned DESC, a.agent_id;
```

Here the date filter *can* go in `WHERE`, because it filters `tickets` before the join. `SUM(condition)`
relies on MySQL treating a boolean as 0/1, which is concise but MySQL-specific. The percentage is
`NULL` for agents with no match because `o.r` and `o.n` are `NULL`. This version is handy when the
per-ticket logic gets complicated, because it keeps that logic in one place.
