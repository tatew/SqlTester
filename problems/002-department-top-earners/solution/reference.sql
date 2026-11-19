SELECT
  d.name   AS department,
  e.name   AS employee,
  e.salary
FROM employees   AS e
JOIN departments AS d ON d.department_id = e.department_id
WHERE e.salary = (
  SELECT MAX(e2.salary)
  FROM employees AS e2
  WHERE e2.department_id = e.department_id
)
ORDER BY department ASC, employee ASC;
