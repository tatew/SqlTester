# 002 · Department Top Earners: why the solution works

```sql
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
```

## How it works

1. **`JOIN departments`**: gives each employee their department's name. Because this is an inner
   join, it also handles two rules automatically:
   - Unassigned employees (`department_id IS NULL`) have nothing to match, since `NULL = anything`
     is never true, so they drop out.
   - Departments with no employees never appear, because every output row starts from an employee.
2. **The correlated subquery**: for *each* employee row `e`, it computes the maximum salary among
   employees in **that same department** (`e2.department_id = e.department_id`). The employee is kept
   only if their salary equals that maximum.
3. **Ties**: if three people share the top salary, all three equal the max, so all three are kept.
   Nothing limits the result to one row per department.
4. **`ORDER BY department, employee`**: sorts by department **name** (not id), then employee name, as
   the prompt asks.

## The traps, and how this query avoids them

| Trap | What goes wrong | Why the reference is safe |
|---|---|---|
| `WHERE salary IN (SELECT MAX(salary) FROM employees GROUP BY department_id)` | The employee is compared against the max of *every* department. Someone in Ops who happens to earn Data's top salary sneaks in. | The subquery is **correlated**: it only looks at the employee's own department. |
| `ROW_NUMBER()` or `LIMIT 1` per department | Only one of several tied top earners is returned. | Comparing with `=` against the max keeps every tied row. |
| `LEFT JOIN` from `departments` | Empty departments show up with NULL employee and salary. | The inner join only produces rows for real employees. |
| Forgetting about `NULL` departments | If you compute the max with `GROUP BY department_id`, the unassigned employees form their own NULL group, which may contain the highest salary overall. | The subquery's `e2.department_id = e.department_id` is never true when `e.department_id` is NULL, and the join drops those rows anyway. |
| `ORDER BY d.department_id` | Department ids aren't in alphabetical order. | The query sorts by the name alias. |

## Other correct ways to write it

**Join to the per-department maximum** (match on *both* department and salary):

```sql
SELECT d.name AS department, e.name AS employee, e.salary
FROM employees AS e
JOIN (SELECT department_id, MAX(salary) AS max_salary
      FROM employees
      WHERE department_id IS NOT NULL
      GROUP BY department_id) AS m
  ON m.department_id = e.department_id AND m.max_salary = e.salary
JOIN departments AS d ON d.department_id = e.department_id
ORDER BY department, employee;
```

**Window function** (`RANK`/`DENSE_RANK` keep ties, `ROW_NUMBER` does not):

```sql
WITH ranked AS (
  SELECT e.*, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM employees AS e
  WHERE department_id IS NOT NULL
)
SELECT d.name AS department, r.name AS employee, r.salary
FROM ranked AS r
JOIN departments AS d ON d.department_id = r.department_id
WHERE r.rnk = 1
ORDER BY department, employee;
```
