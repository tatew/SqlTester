# 003 · Support Agent Scorecard

**Difficulty:** medium · **Suggested time:** 20 minutes

The support manager is putting together a scorecard for the monthly review of **October 2024**.

Write a query that returns one row for **every active agent** (`is_active = 1`), describing the tickets
they were assigned that were **created in October 2024**:

- `tickets_assigned`: how many tickets created in October 2024 are assigned to the agent.
- `tickets_resolved`: how many of those tickets have been resolved (`resolved_at IS NOT NULL`),
  no matter when they were resolved (a ticket created on Oct 30 and resolved on Nov 2 counts).
- `open_urgent`: how many of those tickets have `priority = 'urgent'` and are still open.
- `resolution_pct`: `tickets_resolved / tickets_assigned × 100`, rounded to **1 decimal place**.

Rules:

- Active agents with **no** tickets created in October 2024 must still appear, with `0` for the three
  counts and `NULL` for `resolution_pct`.
- Inactive agents (`is_active = 0`) never appear, even if they have October tickets.
- Unassigned tickets (`agent_id IS NULL`) are ignored.

## Schema

```sql
CREATE TABLE agents (
  agent_id  INT          PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  team      VARCHAR(50)  NOT NULL,
  is_active TINYINT      NOT NULL  -- 1 = currently on the team, 0 = has left
);

CREATE TABLE tickets (
  ticket_id   INT         PRIMARY KEY,
  agent_id    INT         NULL,      -- NULL = not assigned to anyone yet
  created_at  DATETIME    NOT NULL,
  priority    VARCHAR(10) NOT NULL,  -- 'low' | 'normal' | 'high' | 'urgent'
  resolved_at DATETIME    NULL,      -- NULL = still open
  FOREIGN KEY (agent_id) REFERENCES agents (agent_id)
);
```

## Output

| column             | description                                                          |
|--------------------|----------------------------------------------------------------------|
| `agent_id`         | the agent's id                                                       |
| `name`             | the agent's name                                                     |
| `tickets_assigned` | tickets created in October 2024 assigned to the agent                |
| `tickets_resolved` | how many of those are resolved                                       |
| `open_urgent`      | how many of those are urgent and still open                          |
| `resolution_pct`   | `tickets_resolved / tickets_assigned × 100`, rounded to 1 decimal place; `NULL` when `tickets_assigned` is 0 |

Sort by `tickets_assigned` from highest to lowest. Break ties by `agent_id`, lowest first.

## Example

**agents**

| agent_id | name | team | is_active |
|---|---|---|---|
| 1 | Maya Patel | Billing | 1 |
| 2 | Jonas Weber | Billing | 1 |
| 3 | Keiko Sato | Technical | 1 |
| 4 | Luis Moreno | Technical | 1 |
| 5 | Amara Okonkwo | Technical | 0 |
| 6 | Sam Rivera | Billing | 1 |

**tickets**

| ticket_id | agent_id | created_at | priority | resolved_at |
|---|---|---|---|---|
| 1001 | 1 | 2024-10-01 08:15:00 | normal | 2024-10-01 10:00:00 |
| 1002 | 1 | 2024-10-03 11:30:00 | urgent | 2024-10-03 12:05:00 |
| 1003 | 1 | 2024-10-14 16:45:00 | urgent | NULL |
| 1004 | 2 | 2024-10-02 09:00:00 | low | 2024-10-09 17:00:00 |
| 1005 | 2 | 2024-10-20 13:10:00 | high | NULL |
| 1006 | 2 | 2024-10-22 10:00:00 | normal | 2024-10-22 15:30:00 |
| 1007 | 3 | 2024-09-12 14:00:00 | urgent | NULL |
| 1008 | 3 | 2024-10-08 07:50:00 | urgent | NULL |
| 1009 | 3 | 2024-10-09 08:20:00 | high | NULL |
| 1010 | 4 | 2024-10-17 12:00:00 | normal | 2024-10-18 09:00:00 |
| 1011 | 5 | 2024-10-05 10:00:00 | urgent | NULL |
| 1012 | NULL | 2024-10-25 18:40:00 | urgent | NULL |
| 1013 | 4 | 2024-11-04 09:30:00 | low | NULL |

**Expected output**

| agent_id | name | tickets_assigned | tickets_resolved | open_urgent | resolution_pct |
|---|---|---|---|---|---|
| 1 | Maya Patel | 3 | 2 | 1 | 66.7 |
| 2 | Jonas Weber | 3 | 2 | 0 | 66.7 |
| 3 | Keiko Sato | 2 | 0 | 1 | 0.0 |
| 4 | Luis Moreno | 1 | 1 | 0 | 100.0 |
| 6 | Sam Rivera | 0 | 0 | 0 | NULL |

Your query will also be run against several hidden datasets that use the same schema.

## Hints

Each hint gives away a little more than the one before it. Try the problem before you open them.

<details>
<summary>Hint 1</summary>

Start from the agents, not the tickets: the output has one row per active agent, whether or not they
had any tickets. Then work out each of the three counts as its own expression inside one `GROUP BY`.

</details>

<details>
<summary>Hint 2</summary>

Keeping agents who have no matching tickets needs an outer join, and an outer join is easy to undo by
accident: a condition on the *tickets* table in `WHERE` throws away the rows where the ticket columns
are `NULL`. Also think about what `COUNT(*)` and `SUM(...)` return for an agent with no matching
tickets, and remember `created_at` is a `DATETIME`.

</details>

<details>
<summary>Hint 3</summary>

The shape is: `agents LEFT JOIN tickets`, with the "same agent" and "created in October" conditions
in the `ON` clause (October as `>= '2024-10-01' AND < '2024-11-01'`), and `is_active = 1` in `WHERE`.
Group by the agent. Count a column from `tickets` rather than `*`; count only urgent open tickets with
`SUM(CASE WHEN ... THEN 1 ELSE 0 END)` (the `ELSE 0` matters); and build the percentage from the
two counts, using `NULLIF` (or the fact that dividing by zero gives `NULL` in MySQL) for empty agents.

</details>
