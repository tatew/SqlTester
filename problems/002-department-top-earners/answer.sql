-- 002 · Department Top Earners — the prompt is in problem.md
-- Write your query below, then:   ./sqlt.sh check 2     (or ./sqlt.sh check 2 --watch)
-- Just see your output:           ./sqlt.sh run 2
-- Poke at the data:               ./sqlt.sh shell 2

SELECT
    d.name AS department,
    e.name AS employee,
    e.salary
FROM departments as d 
JOIN employees as e on e.department_id = d.department_id
WHERE e.salary = (
    SELECT MAX(e2.salary)
    FROM employees as e2
    WHERE e2.department_id = e.department_id
)
ORDER BY d.name ASC, e.name ASC