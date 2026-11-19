-- Nobody qualifies: the correct answer is an empty result.
INSERT INTO customers (customer_id, name, email, country, signup_date) VALUES
  (1, 'Wes Adams',  'wes@example.com',  'US', '2022-01-01'),
  (2, 'Xia Chen',   'xia@example.com',  'CN', '2022-01-01'),
  (3, 'Yara Silva', 'yara@example.com', 'BR', '2022-01-01');

INSERT INTO orders (order_id, customer_id, ordered_at, status, total_amount) VALUES
  (1, 2, '2024-08-08 08:00:00', 'completed', 80.00),
  (2, 3, '2023-04-04 10:00:00', 'completed', 40.00),
  (3, 3, '2023-09-09 10:00:00', 'completed', 40.00);
