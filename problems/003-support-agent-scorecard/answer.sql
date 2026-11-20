-- 003 · Support Agent Scorecard — the prompt is in problem.md
-- Write your query below, then:   ./sqlt.sh check 3     (or ./sqlt.sh check 3 --watch)
-- Just see your output:           ./sqlt.sh run 3
-- Poke at the data:               ./sqlt.sh shell 3

SELECT 
    a.agent_id,
    a.name,
    COUNT(t.ticket_id) AS tickets_assigned,
    COUNT(t.resolved_at) AS tickets_resolved,
    SUM(CASE WHEN t.resolved_at IS NULL AND t.priority = 'urgent' THEN 1 ELSE 0 END) AS open_urgent,
    ROUND(100 * COUNT(t.resolved_at) / COUNT(t.ticket_id), 1) AS resolution_pct
FROM agents AS a LEFT JOIN tickets AS t 
    ON t.agent_id = a.agent_id 
        AND t.created_at >= '2024-10-01' 
        AND t.created_at < '2024-11-01'
WHERE a.is_active = 1 
GROUP BY a.agent_id, a.name
ORDER BY tickets_assigned DESC, a.agent_id ASC;