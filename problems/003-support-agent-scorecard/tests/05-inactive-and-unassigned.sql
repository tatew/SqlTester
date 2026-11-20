-- Inactive agents must be left out entirely, even when they have October tickets, and
-- unassigned tickets are ignored. Catches no is_active filter, putting is_active in the
-- LEFT JOIN's ON clause (inactive agents then appear with zeros), and starting from tickets.
INSERT INTO agents (agent_id, name, team, is_active) VALUES
  (1, 'Gus Ortega',   'Billing',   0),
  (2, 'Ivy Chen',     'Billing',   1),
  (3, 'Theo Grant',   'Technical', 0),
  (4, 'Uma Rao',      'Technical', 1);

INSERT INTO tickets (ticket_id, agent_id, created_at, priority, resolved_at) VALUES
  (1, 1,    '2024-10-02 09:00:00', 'urgent', NULL),
  (2, 1,    '2024-10-03 09:00:00', 'urgent', NULL),
  (3, 1,    '2024-10-04 09:00:00', 'normal', '2024-10-04 10:00:00'),
  (4, 2,    '2024-10-05 09:00:00', 'urgent', NULL),
  (5, 2,    '2024-10-06 09:00:00', 'normal', '2024-10-06 10:00:00'),
  (6, NULL, '2024-10-07 09:00:00', 'urgent', NULL),
  (7, NULL, '2024-10-08 09:00:00', 'urgent', NULL),
  (8, NULL, '2024-10-09 09:00:00', 'high',   NULL);
