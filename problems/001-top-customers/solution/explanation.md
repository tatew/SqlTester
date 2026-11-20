# 001 · Top Customers of 2024: why the solution works

```sql
SELECT
  c.customer_id,
  c.name,
  COUNT(*)            AS completed_orders,
  SUM(o.total_amount) AS total_spent
FROM customers AS c
JOIN orders    AS o ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
  AND o.ordered_at >= '2024-01-01'
  AND o.ordered_at <  '2025-01-01'
GROUP BY c.customer_id, c.name
HAVING COUNT(*) >= 2
ORDER BY total_spent DESC, c.customer_id ASC;
```

## Clause by clause

MySQL logically runs the clauses in this order: `FROM/JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`.

1. **`JOIN`**: pairs each order with its customer. An inner join is correct here, because a customer
   with no orders can't have 2 completed orders, so we never need customers without matches.
2. **`WHERE`**: removes individual order rows *before* grouping. Only completed orders placed in 2024
   survive. Because the filter runs first, both `COUNT(*)` and `SUM(...)` see only the qualifying
   orders, so the count and the total are always consistent with each other.
3. **`GROUP BY c.customer_id, c.name`**: one group per customer. `customer_id` is the primary key,
   so it identifies a customer uniquely. `name` is included so it can appear in `SELECT` (MySQL
   would also allow it without, since it depends on the primary key).
4. **`HAVING COUNT(*) >= 2`**: removes whole groups *after* counting. This condition can't go in
   `WHERE`, because the count doesn't exist until rows are grouped.
5. **`ORDER BY total_spent DESC, c.customer_id ASC`**: the required sort, with the tie-break.
   `ORDER BY` runs after `SELECT`, so it can use the alias `total_spent`.

## The traps, and how this query avoids them

| Trap | What goes wrong | Why the reference is safe |
|---|---|---|
| `BETWEEN '2024-01-01' AND '2024-12-31'` | `'2024-12-31'` means midnight at the *start* of Dec 31, so orders later that day are dropped. | The half-open range `>= '2024-01-01' AND < '2025-01-01'` covers every moment of 2024. |
| `YEAR(ordered_at) = 2024` | This gives the right result, but wrapping the column in a function stops MySQL from using an index on it. | A plain range comparison can use an index. This doesn't affect grading, but interviewers notice it. |
| Filtering status in only one place, e.g. `SUM(CASE WHEN status='completed' ...)` while still using `COUNT(*)` over all rows | The count includes cancelled or refunded orders. | The status filter is in `WHERE`, so it applies to every aggregate. |
| `GROUP BY c.name` | Two different customers who share a name get merged into one row. | The query groups by the primary key. |
| Missing tie-break | Customers with equal totals come back in an unpredictable order. | `customer_id ASC` makes the order deterministic. |
| Expecting at least one row | If nobody qualifies, the correct answer is an empty result. | `HAVING` simply removes every group. Nothing special is needed. |

## Other correct ways to write it

- `WHERE o.ordered_at >= '2024-01-01' AND o.ordered_at < '2025-01-01'` could also be written as
  `YEAR(o.ordered_at) = 2024` (correct, just not index-friendly).
- You could aggregate `orders` alone in a CTE/derived table (grouped by `customer_id`), then join that
  to `customers` for the name. It gives the same result, and some people find it easier to read.
