-- Orders right at the edges of 2024. ordered_at is a DATETIME, so
-- BETWEEN '2024-01-01' AND '2024-12-31' silently drops most of Dec 31.
INSERT INTO customers (customer_id, name, email, country, signup_date) VALUES
  (1, 'Olivia Park',  'olivia@example.com', 'US', '2023-01-01'),
  (2, 'Peter Novak',  'peter@example.com',  'CZ', '2023-01-01'),
  (3, 'Quinn Murphy', 'quinn@example.com',  'IE', '2023-01-01'),
  (4, 'Rosa Alvarez', 'rosa@example.com',   'ES', '2023-01-01');

INSERT INTO orders (order_id, customer_id, ordered_at, status, total_amount) VALUES
  (1, 1, '2023-12-31 23:59:59', 'completed', 1000.00),
  (2, 1, '2024-01-01 00:00:00', 'completed',   10.00),
  (3, 1, '2024-06-01 12:00:00', 'completed',   20.00),
  (4, 2, '2024-03-03 12:00:00', 'completed',   60.00),
  (5, 2, '2024-12-31 18:30:00', 'completed',   40.00),
  (6, 3, '2024-07-07 07:00:00', 'completed',    5.00),
  (7, 3, '2025-01-01 00:00:00', 'completed',  500.00),
  (8, 4, '2024-12-31 00:00:00', 'completed',    2.00),
  (9, 4, '2024-12-31 23:59:59', 'completed',    1.00);
