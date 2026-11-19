-- Carl earns exactly Data's top salary but works in Ops.
-- "salary IN (SELECT MAX(salary) ... GROUP BY department_id)" wrongly includes him.
INSERT INTO departments (department_id, name) VALUES
  (1, 'Data'),
  (2, 'Ops');

INSERT INTO employees (employee_id, name, department_id, salary, hire_date) VALUES
  (1, 'Alice Moreau', 1, 100000, '2020-01-01'),
  (2, 'Dana Kerr',    1,  90000, '2021-01-01'),
  (3, 'Bob Hale',     2, 120000, '2019-01-01'),
  (4, 'Carl Jensen',  2, 100000, '2022-01-01'),
  (5, 'Eve Sato',     2,  95000, '2023-01-01');
