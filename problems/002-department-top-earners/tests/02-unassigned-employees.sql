-- Several employees with no department, including the highest earners overall.
INSERT INTO departments (department_id, name) VALUES
  (1, 'Finance'),
  (2, 'Support');

INSERT INTO employees (employee_id, name, department_id, salary, hire_date) VALUES
  (1, 'Gina Rossi',   NULL, 250000, '2018-01-01'),
  (2, 'Hank Mills',   NULL, 250000, '2019-01-01'),
  (3, 'Ines Duarte',  1,     88000, '2020-01-01'),
  (4, 'Jon Berg',     1,     70000, '2021-01-01'),
  (5, 'Kara Novak',   2,     52000, '2022-01-01'),
  (6, 'Liam Byrne',   NULL,  52000, '2022-06-01');
