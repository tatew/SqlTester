-- Two different customers share a name (group by id, not name),
-- and several customers tie on total_spent (tie-break on customer_id).
INSERT INTO customers (customer_id, name, email, country, signup_date) VALUES
  (5, 'Lee Wong',   'lee@example.com',     'SG', '2023-02-02'),
  (3, 'Jordan Fox', 'jordan@example.com',  'US', '2023-02-02'),
  (1, 'Sam Patel',  'sam.p@example.com',   'US', '2023-02-02'),
  (4, 'Ana Ruiz',   'ana@example.com',     'AR', '2023-02-02'),
  (2, 'Sam Patel',  'sam.p2@example.com',  'GB', '2023-02-02');

INSERT INTO orders (order_id, customer_id, ordered_at, status, total_amount) VALUES
  (1,  5, '2024-01-10 10:00:00', 'completed', 99.99),
  (2,  5, '2024-01-11 10:00:00', 'completed',  0.01),
  (3,  3, '2024-02-10 10:00:00', 'completed', 60.00),
  (4,  3, '2024-02-11 10:00:00', 'completed', 40.00),
  (5,  1, '2024-03-10 10:00:00', 'completed', 50.00),
  (6,  1, '2024-03-11 10:00:00', 'completed', 50.00),
  (7,  2, '2024-04-10 10:00:00', 'completed', 70.00),
  (8,  2, '2024-04-11 10:00:00', 'completed', 30.00),
  (9,  4, '2024-05-10 10:00:00', 'completed', 40.00),
  (10, 4, '2024-05-11 10:00:00', 'completed', 40.00),
  (11, 4, '2024-05-12 10:00:00', 'completed', 40.00);
