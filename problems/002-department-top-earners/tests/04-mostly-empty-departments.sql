-- Only one department has anyone in it; empty departments must not appear.
INSERT INTO departments (department_id, name) VALUES
  (1, 'Accounting'),
  (2, 'Design'),
  (3, 'Security'),
  (4, 'Procurement');

INSERT INTO employees (employee_id, name, department_id, salary, hire_date) VALUES
  (1, 'Rhea Kapoor', 2, 99000, '2021-05-05');
