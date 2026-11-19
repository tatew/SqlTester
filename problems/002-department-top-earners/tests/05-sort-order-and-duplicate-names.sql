-- Department ids are not in alphabetical order (sort by department NAME),
-- and two different people share a name.
INSERT INTO departments (department_id, name) VALUES
  (1, 'Zeta Labs'),
  (2, 'Alpha Team'),
  (3, 'Mid Office');

INSERT INTO employees (employee_id, name, department_id, salary, hire_date) VALUES
  (1, 'Chris Lee',    1, 130000, '2019-01-01'),
  (2, 'Bea Thornton', 1,  90000, '2020-01-01'),
  (3, 'Chris Lee',    2,  80000, '2021-01-01'),
  (4, 'Abe Collins',  2,  80000, '2022-01-01'),
  (5, 'Zoe Hart',     3,  75000, '2023-01-01'),
  (6, 'Yann Roux',    3,  74000, '2023-02-01');
