# 002 · Department Top Earners

**Difficulty:** medium · **Suggested time:** 20 minutes

HR is reviewing compensation and wants to know who the highest-paid person is in each department.

Write a query that returns, for **each department**, the employee(s) with the **highest salary in
that department**.

- If several employees in a department tie for the highest salary, return **all** of them.
- Employees who are not assigned to a department (`department_id IS NULL`) are ignored.
- Departments with no employees do not appear in the output.

## Schema

```sql
CREATE TABLE departments (
  department_id INT         PRIMARY KEY,
  name          VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE employees (
  employee_id   INT          PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  department_id INT          NULL,      -- references departments.department_id; NULL = unassigned
  salary        INT          NOT NULL,
  hire_date     DATE         NOT NULL
);
```

## Output

| column       | description              |
|--------------|--------------------------|
| `department` | the department's name    |
| `employee`   | the employee's name      |
| `salary`     | the employee's salary    |

Sort by `department` alphabetically, then by `employee` alphabetically.

## Example

**departments**

| department_id | name |
|---|---|
| 1 | Engineering |
| 2 | Sales |
| 3 | Marketing |
| 4 | Legal |

**employees**

| employee_id | name | department_id | salary | hire_date |
|---|---|---|---|---|
| 1 | Priya Shah | 1 | 145000 | 2019-04-01 |
| 2 | Marcus Bell | 1 | 132000 | 2020-09-15 |
| 3 | Lena Fischer | 1 | 145000 | 2021-01-10 |
| 4 | Tom Okafor | 2 | 98000 | 2018-06-01 |
| 5 | Sara Lind | 2 | 105000 | 2022-03-01 |
| 6 | Yusuf Demir | 2 | 87000 | 2023-07-19 |
| 7 | Nora Quinn | 3 | 91000 | 2020-11-30 |
| 8 | Ivan Petrov | 3 | 76000 | 2024-02-05 |
| 9 | Kai Morgan | NULL | 160000 | 2024-08-01 |

**Expected output**

| department | employee | salary |
|---|---|---|
| Engineering | Lena Fischer | 145000 |
| Engineering | Priya Shah | 145000 |
| Marketing | Nora Quinn | 91000 |
| Sales | Sara Lind | 105000 |

Your query will also be run against several hidden datasets that use the same schema.
