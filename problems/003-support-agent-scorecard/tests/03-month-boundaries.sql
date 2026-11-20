-- Tickets right at the edges of October. created_at is a DATETIME, so
-- BETWEEN '2024-10-01' AND '2024-10-31' drops nearly all of Oct 31,
-- and <= '2024-11-01' wrongly includes a ticket created at midnight on Nov 1.
INSERT INTO agents (agent_id, name, team, is_active) VALUES
  (1, 'Ian Brooks',   'Billing',   1),
  (2, 'Lea Martin',   'Billing',   1),
  (3, 'Noah Fischer', 'Technical', 1);

INSERT INTO tickets (ticket_id, agent_id, created_at, priority, resolved_at) VALUES
  (1, 1, '2024-09-30 23:59:59', 'urgent', NULL),
  (2, 1, '2024-10-01 00:00:00', 'normal', '2024-10-01 02:00:00'),
  (3, 2, '2024-10-31 14:30:00', 'urgent', NULL),
  (4, 2, '2024-10-31 23:59:59', 'high',   '2024-11-01 08:00:00'),
  (5, 2, '2024-10-15 09:00:00', 'normal', '2024-10-15 10:00:00'),
  (6, 3, '2024-11-01 00:00:00', 'urgent', NULL),
  (7, 3, '2024-11-01 00:00:00', 'normal', NULL),
  (8, 3, '2024-10-20 12:00:00', 'low',    '2024-10-21 12:00:00');
