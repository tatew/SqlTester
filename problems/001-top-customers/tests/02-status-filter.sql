-- Only completed orders count, for both the count and the total.
INSERT INTO customers (customer_id, name, email, country, signup_date) VALUES
  (1, 'Sven Berg',    'sven@example.com',  'SE', '2023-05-05'),
  (2, 'Tara Singh',   'tara@example.com',  'IN', '2023-05-05'),
  (3, 'Umar Farouk',  'umar@example.com',  'NG', '2023-05-05'),
  (4, 'Vera Ivanova', 'vera@example.com',  'BG', '2023-05-05');

INSERT INTO orders (order_id, customer_id, ordered_at, status, total_amount) VALUES
  (1,  1, '2024-02-01 10:00:00', 'completed',   50.00),
  (2,  1, '2024-02-02 10:00:00', 'cancelled',  500.00),
  (3,  1, '2024-02-03 10:00:00', 'refunded',   300.00),
  (4,  2, '2024-03-01 10:00:00', 'completed',   20.00),
  (5,  2, '2024-03-02 10:00:00', 'completed',   30.00),
  (6,  2, '2024-03-03 10:00:00', 'cancelled', 1000.00),
  (7,  3, '2024-04-01 10:00:00', 'refunded',    80.00),
  (8,  3, '2024-04-02 10:00:00', 'refunded',    80.00),
  (9,  4, '2024-05-01 10:00:00', 'completed',   10.00),
  (10, 4, '2024-05-02 10:00:00', 'completed',   10.00),
  (11, 4, '2024-05-03 10:00:00', 'completed',   10.00);
