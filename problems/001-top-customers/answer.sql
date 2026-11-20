-- 001 · Top Customers of 2024 — the prompt is in problem.md
-- Write your query below, then:   ./sqlt.sh check 1     (or ./sqlt.sh check 1 --watch)
-- Just see your output:           ./sqlt.sh run 1
-- Poke at the data:               ./sqlt.sh shell 1

SELECT 
    c.customer_id,
    c.name,
    COUNT(*)            AS completed_orders,
    SUM(o.total_amount) AS total_spent
FROM customers AS c
JOIN orders AS o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
    AND o.ordered_at >= '2024-01-01'
    AND o.ordered_at <  '2025-01-01'
GROUP BY c.customer_id
HAVING COUNT(*) >= 2
ORDER BY total_spent DESC, c.customer_id ASC;

