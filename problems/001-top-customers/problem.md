# 001 · Top Customers of 2024

**Difficulty:** easy · **Suggested time:** 15 minutes

The marketing team wants to send a thank-you gift to repeat customers from last year.

Write a query that returns every customer who placed **at least 2 completed orders** during
**calendar year 2024**. For each one, report how many completed 2024 orders they placed and the
total amount spent across those orders.

Only orders with `status = 'completed'` count, for both the number of orders and the total.

## Schema

```sql
CREATE TABLE customers (
  customer_id INT          PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  country     CHAR(2)      NOT NULL,
  signup_date DATE         NOT NULL
);

CREATE TABLE orders (
  order_id     INT           PRIMARY KEY,
  customer_id  INT           NOT NULL,   -- references customers.customer_id
  ordered_at   DATETIME      NOT NULL,
  status       VARCHAR(20)   NOT NULL,   -- 'completed' | 'cancelled' | 'refunded'
  total_amount DECIMAL(10,2) NOT NULL
);
```

## Output

| column             | description                                            |
|--------------------|--------------------------------------------------------|
| `customer_id`      | the customer's id                                      |
| `name`             | the customer's name                                    |
| `completed_orders` | number of completed orders placed in 2024              |
| `total_spent`      | sum of `total_amount` over those completed 2024 orders |

Sort by `total_spent` from highest to lowest. Break ties by `customer_id`, lowest first.

## Example

**customers**

| customer_id | name | email | country | signup_date |
|---|---|---|---|---|
| 1 | Ava Thompson | ava@example.com | US | 2023-03-14 |
| 2 | Ben Carter | ben@example.com | GB | 2023-07-02 |
| 3 | Chloe Nguyen | chloe@example.com | US | 2024-01-20 |
| 4 | Diego Ramirez | diego@example.com | MX | 2024-02-11 |
| 5 | Emma Schulz | emma@example.com | DE | 2024-05-30 |
| 6 | Farah Haddad | farah@example.com | CA | 2024-08-08 |
| 7 | Grace Lee | grace@example.com | US | 2024-10-01 |
| 8 | Hiro Tanaka | hiro@example.com | JP | 2024-11-15 |

**orders**

| order_id | customer_id | ordered_at | status | total_amount |
|---|---|---|---|---|
| 101 | 1 | 2024-01-15 09:12:00 | completed | 120.00 |
| 102 | 1 | 2024-03-02 14:45:00 | completed | 75.50 |
| 103 | 1 | 2024-06-21 18:03:00 | cancelled | 200.00 |
| 104 | 2 | 2023-12-30 11:00:00 | completed | 300.00 |
| 105 | 2 | 2024-02-14 08:30:00 | completed | 45.00 |
| 106 | 3 | 2024-02-01 10:00:00 | completed | 60.00 |
| 107 | 3 | 2024-04-11 16:20:00 | completed | 89.99 |
| 108 | 3 | 2024-09-09 12:00:00 | completed | 150.01 |
| 109 | 4 | 2024-05-05 19:45:00 | completed | 500.00 |
| 110 | 4 | 2024-05-06 09:00:00 | refunded | 500.00 |
| 111 | 5 | 2024-07-07 07:07:00 | completed | 35.00 |
| 112 | 5 | 2024-08-19 13:15:00 | completed | 40.00 |
| 113 | 6 | 2024-11-28 20:00:00 | completed | 210.00 |
| 114 | 6 | 2025-01-03 10:30:00 | completed | 99.00 |
| 115 | 1 | 2024-10-10 10:10:00 | completed | 54.50 |
| 116 | 8 | 2024-12-12 12:12:00 | completed | 20.00 |
| 117 | 7 | 2024-10-15 15:00:00 | completed | 125.00 |
| 118 | 7 | 2024-12-01 09:45:00 | completed | 125.00 |

**Expected output**

| customer_id | name | completed_orders | total_spent |
|---|---|---|---|
| 3 | Chloe Nguyen | 3 | 300.00 |
| 1 | Ava Thompson | 3 | 250.00 |
| 7 | Grace Lee | 2 | 250.00 |
| 5 | Emma Schulz | 2 | 75.00 |

Your query will also be run against several hidden datasets that use the same schema.
