INSERT INTO agents (agent_id, name, team, is_active) VALUES
  (1, 'Maya Patel',     'Billing',   1),
  (2, 'Jonas Weber',    'Billing',   1),
  (3, 'Keiko Sato',     'Technical', 1),
  (4, 'Luis Moreno',    'Technical', 1),
  (5, 'Amara Okonkwo',  'Technical', 0),
  (6, 'Sam Rivera',     'Billing',   1);

INSERT INTO tickets (ticket_id, agent_id, created_at, priority, resolved_at) VALUES
  (1001, 1, '2024-10-01 08:15:00', 'normal', '2024-10-01 10:00:00'),
  (1002, 1, '2024-10-03 11:30:00', 'urgent', '2024-10-03 12:05:00'),
  (1003, 1, '2024-10-14 16:45:00', 'urgent', NULL),
  (1004, 2, '2024-10-02 09:00:00', 'low',    '2024-10-09 17:00:00'),
  (1005, 2, '2024-10-20 13:10:00', 'high',   NULL),
  (1006, 2, '2024-10-22 10:00:00', 'normal', '2024-10-22 15:30:00'),
  (1007, 3, '2024-09-12 14:00:00', 'urgent', NULL),
  (1008, 3, '2024-10-08 07:50:00', 'urgent', NULL),
  (1009, 3, '2024-10-09 08:20:00', 'high',   NULL),
  (1010, 4, '2024-10-17 12:00:00', 'normal', '2024-10-18 09:00:00'),
  (1011, 5, '2024-10-05 10:00:00', 'urgent', NULL),
  (1012, NULL, '2024-10-25 18:40:00', 'urgent', NULL),
  (1013, 4, '2024-11-04 09:30:00', 'low',    NULL);
