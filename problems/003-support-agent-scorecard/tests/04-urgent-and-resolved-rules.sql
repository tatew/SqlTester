-- open_urgent needs BOTH conditions (urgent AND still open); a ticket resolved in November
-- still counts as resolved. Catches counting every urgent ticket, counting every open ticket,
-- and only counting resolutions that happened in October.
INSERT INTO agents (agent_id, name, team, is_active) VALUES
  (1, 'Dana Wolfe',   'Billing',   1),
  (2, 'Eli Novak',    'Technical', 1),
  (3, 'Mia Russo',    'Technical', 1);

INSERT INTO tickets (ticket_id, agent_id, created_at, priority, resolved_at) VALUES
  (1,  1, '2024-10-02 09:00:00', 'urgent', '2024-10-02 09:30:00'),
  (2,  1, '2024-10-03 09:00:00', 'urgent', '2024-10-03 10:00:00'),
  (3,  1, '2024-10-04 09:00:00', 'high',   NULL),
  (4,  1, '2024-10-05 09:00:00', 'normal', NULL),
  (5,  1, '2024-10-06 09:00:00', 'urgent', NULL),
  (6,  2, '2024-10-28 09:00:00', 'normal', '2024-11-03 09:00:00'),
  (7,  2, '2024-10-29 09:00:00', 'urgent', '2024-11-02 09:00:00'),
  (8,  2, '2024-10-30 09:00:00', 'low',    '2024-11-05 09:00:00'),
  (9,  3, '2024-10-10 09:00:00', 'high',   NULL),
  (10, 3, '2024-10-11 09:00:00', 'low',    NULL),
  (11, 3, '2024-10-12 09:00:00', 'normal', '2024-10-12 10:00:00'),
  (12, 3, '2024-10-13 09:00:00', 'normal', '2024-10-13 10:00:00'),
  (13, 3, '2024-10-14 09:00:00', 'normal', '2024-10-14 10:00:00'),
  (14, 3, '2024-10-15 09:00:00', 'low',    NULL),
  (15, 3, '2024-10-16 09:00:00', 'high',   '2024-10-16 10:00:00');
