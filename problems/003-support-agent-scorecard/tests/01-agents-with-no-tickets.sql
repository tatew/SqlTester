-- Active agents who have never had a ticket must still appear with zeros (and a NULL percentage).
-- Catches INNER JOIN, COUNT(*) after a LEFT JOIN (counts 1 instead of 0),
-- and joining to pre-aggregated counts without COALESCE (NULL instead of 0).
INSERT INTO agents (agent_id, name, team, is_active) VALUES
  (1, 'Rita Gomez',   'Billing',   1),
  (2, 'Owen Clarke',  'Billing',   1),
  (3, 'Priya Nair',   'Technical', 1),
  (4, 'Felix Braun',  'Technical', 1);

INSERT INTO tickets (ticket_id, agent_id, created_at, priority, resolved_at) VALUES
  (1, 3, '2024-10-02 09:00:00', 'urgent', NULL),
  (2, 3, '2024-10-05 10:00:00', 'normal', '2024-10-05 11:00:00'),
  (3, 3, '2024-10-07 11:00:00', 'low',    '2024-10-08 11:00:00'),
  (4, 1, '2024-10-12 12:00:00', 'high',   '2024-10-12 13:00:00');
