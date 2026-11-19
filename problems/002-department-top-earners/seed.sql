INSERT INTO departments (department_id, name) VALUES
  (1, 'Engineering'),
  (2, 'Sales'),
  (3, 'Marketing'),
  (4, 'Legal');

INSERT INTO employees (employee_id, name, department_id, salary, hire_date) VALUES
  (1, 'Priya Shah',   1,    145000, '2019-04-01'),
  (2, 'Marcus Bell',  1,    132000, '2020-09-15'),
  (3, 'Lena Fischer', 1,    145000, '2021-01-10'),
  (4, 'Tom Okafor',   2,     98000, '2018-06-01'),
  (5, 'Sara Lind',    2,    105000, '2022-03-01'),
  (6, 'Yusuf Demir',  2,     87000, '2023-07-19'),
  (7, 'Nora Quinn',   3,     91000, '2020-11-30'),
  (8, 'Ivan Petrov',  3,     76000, '2024-02-05'),
  (9, 'Kai Morgan',   NULL, 160000, '2024-08-01');
