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
