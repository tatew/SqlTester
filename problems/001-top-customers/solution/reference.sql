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
