-- Whole department tied (return all of them), plus a one-person department.
-- Catches LIMIT 1 / ROW_NUMBER() where ties should be kept.
INSERT INTO departments (department_id, name) VALUES
  (1, 'Research'),
  (2, 'Facilities');

INSERT INTO employees (employee_id, name, department_id, salary, hire_date) VALUES
  (1, 'Mia Laurent', 1, 110000, '2020-01-01'),
  (2, 'Noah Grant',  1, 110000, '2020-02-01'),
  (3, 'Owen Price',  1, 110000, '2020-03-01'),
  (4, 'Pia Kohler',  2,  61000, '2021-01-01');
