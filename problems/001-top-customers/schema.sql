CREATE TABLE customers (
  customer_id INT          PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  country     CHAR(2)      NOT NULL,
  signup_date DATE         NOT NULL
);

CREATE TABLE orders (
  order_id     INT           PRIMARY KEY,
  customer_id  INT           NOT NULL,
  ordered_at   DATETIME      NOT NULL,
  status       VARCHAR(20)   NOT NULL, -- 'completed' | 'cancelled' | 'refunded'
  total_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);
