-- Agents whose tickets all fall outside October 2024 must still appear with zeros.
-- Catches a LEFT JOIN whose date filter sits in WHERE (which turns it back into an inner join),
-- and forgetting the date filter entirely.
INSERT INTO agents (agent_id, name, team, is_active) VALUES
  (1, 'Hana Kim',     'Billing',   1),
  (2, 'Victor Lund',  'Technical', 1),
  (3, 'Zoe Adams',    'Technical', 1);

INSERT INTO tickets (ticket_id, agent_id, created_at, priority, resolved_at) VALUES
  (1, 1, '2024-09-14 09:00:00', 'urgent', NULL),
  (2, 1, '2024-11-20 09:00:00', 'urgent', NULL),
  (3, 1, '2023-10-10 09:00:00', 'normal', '2023-10-11 09:00:00'),
  (4, 2, '2024-10-03 09:00:00', 'normal', '2024-10-03 10:00:00'),
  (5, 2, '2024-12-01 09:00:00', 'urgent', NULL),
  (6, 3, '2024-10-18 09:00:00', 'urgent', NULL),
  (7, 3, '2024-10-19 09:00:00', 'normal', NULL),
  (8, 3, '2024-08-01 09:00:00', 'low',    '2024-08-02 09:00:00');
