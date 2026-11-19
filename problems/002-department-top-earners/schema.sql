CREATE TABLE departments (
  department_id INT         PRIMARY KEY,
  name          VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE employees (
  employee_id   INT          PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  department_id INT          NULL, -- NULL = not assigned to a department (e.g. contractors)
  salary        INT          NOT NULL,
  hire_date     DATE         NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments (department_id)
);
