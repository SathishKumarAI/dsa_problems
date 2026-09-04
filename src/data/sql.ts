import type { SqlProblem } from "./types"

// Original SQL practice set. Shared toy schema unless a problem states its own.
const SHOP = `orders(order_id, customer_id, order_date, amount)
customers(customer_id, name, city, signup_date)
products(product_id, name, category, price)
order_items(order_id, product_id, qty)`

export const SQL_PROBLEMS: SqlProblem[] = [
  {
    id: "second-highest",
    title: "Second-Highest Order Amount",
    difficulty: "easy",
    schema: SHOP,
    question:
      "Return the second-highest distinct order amount. If fewer than two distinct amounts exist, return NULL.",
    hints: [
      "MAX of everything strictly below the MAX.",
      "OFFSET 1 after ordering distinct amounts also works — wrap it to get NULL on empty.",
    ],
    solution: `SELECT MAX(amount) AS second_highest
FROM orders
WHERE amount < (SELECT MAX(amount) FROM orders);`,
    explanation:
      "The inner query pins the maximum; the outer takes the max of what's left. MAX over an empty set yields NULL for free — which is why this beats LIMIT/OFFSET, which returns no row instead of a NULL.",
  },
  {
    id: "dedupe-latest",
    title: "Keep Only the Latest Row per Customer",
    difficulty: "medium",
    schema: SHOP,
    question:
      "Return each customer's most recent order (all columns). Ties on date: highest order_id wins.",
    hints: [
      "ROW_NUMBER() partitioned by customer, ordered by date (and id) descending.",
      "Filter rank = 1 in an outer query — window functions can't sit in WHERE.",
    ],
    solution: `SELECT order_id, customer_id, order_date, amount
FROM (
  SELECT o.*,
         ROW_NUMBER() OVER (
           PARTITION BY customer_id
           ORDER BY order_date DESC, order_id DESC
         ) AS rn
  FROM orders o
) ranked
WHERE rn = 1;`,
    explanation:
      "ROW_NUMBER gives exactly one 1 per partition, so ties are broken deterministically by the ORDER BY. RANK would return multiple rows on ties — the wrong tool when you want one row per customer.",
  },
  {
    id: "gap-detection",
    title: "Customers With No Orders",
    difficulty: "easy",
    schema: SHOP,
    question: "List customers who have never placed an order.",
    hints: [
      "LEFT JOIN + IS NULL, or NOT EXISTS.",
      "NOT IN breaks if the subquery can return NULL — know why before using it.",
    ],
    solution: `SELECT c.customer_id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.customer_id
);`,
    explanation:
      "NOT EXISTS is NULL-safe and typically optimizes to an anti-join. The NOT IN version silently returns zero rows if any order has a NULL customer_id, because x NOT IN (…, NULL) is never true — a classic production bug.",
  },
  {
    id: "running-total",
    title: "Running Revenue by Day",
    difficulty: "medium",
    schema: SHOP,
    question: "For each order date, show that day's revenue and the cumulative revenue up to and including it.",
    hints: [
      "Aggregate to daily first (GROUP BY), then window over the aggregate.",
      "SUM(...) OVER (ORDER BY day) defaults to a running frame.",
    ],
    solution: `SELECT order_date,
       SUM(amount) AS day_revenue,
       SUM(SUM(amount)) OVER (ORDER BY order_date) AS running_revenue
FROM orders
GROUP BY order_date
ORDER BY order_date;`,
    explanation:
      "SUM(SUM(amount)) looks odd but is standard: the inner SUM is the group aggregate, the outer is a window over those group rows. ORDER BY inside OVER implies RANGE UNBOUNDED PRECEDING — the running total.",
  },
  {
    id: "top-n-per-group",
    title: "Top 2 Products per Category by Revenue",
    difficulty: "medium",
    schema: SHOP,
    question: "For every product category, return the two products with the highest total revenue (price × total qty sold).",
    hints: [
      "Join items to products, aggregate revenue per product.",
      "DENSE_RANK per category over that aggregate, keep rank ≤ 2.",
    ],
    solution: `WITH revenue AS (
  SELECT p.category, p.name,
         SUM(p.price * oi.qty) AS total_rev
  FROM products p
  JOIN order_items oi ON oi.product_id = p.product_id
  GROUP BY p.category, p.name
)
SELECT category, name, total_rev
FROM (
  SELECT r.*,
         DENSE_RANK() OVER (
           PARTITION BY category ORDER BY total_rev DESC
         ) AS rnk
  FROM revenue r
) t
WHERE rnk <= 2
ORDER BY category, total_rev DESC;`,
    explanation:
      "CTE isolates the aggregation; the window ranks inside each category. DENSE_RANK admits ties (two #1s both appear); swap in ROW_NUMBER if you must return exactly two rows.",
  },
  {
    id: "month-over-month",
    title: "Month-over-Month Revenue Growth",
    difficulty: "hard",
    schema: SHOP,
    question:
      "Return each month's revenue and its percentage change versus the previous month.",
    hints: [
      "Truncate dates to month, aggregate, then LAG for the previous row.",
      "Guard the division: the first month has no predecessor.",
    ],
    solution: `WITH monthly AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(amount) AS revenue
  FROM orders
  GROUP BY 1
)
SELECT month, revenue,
       ROUND(
         100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
         / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
         1
       ) AS pct_change
FROM monthly
ORDER BY month;`,
    explanation:
      "LAG reaches one row back within the ordered window. NULLIF turns a zero denominator into NULL instead of an error, and the first month's LAG is NULL so its pct_change is NULL — both are the correct semantics, not bugs to patch.",
  },
  {
    id: "consecutive-days",
    title: "Customers Active 3+ Days in a Row",
    difficulty: "hard",
    schema: SHOP,
    question: "Find customers who placed orders on at least three consecutive calendar days.",
    hints: [
      "Classic islands problem: date minus ROW_NUMBER (over distinct dates) is constant within a consecutive run.",
      "Group by that constant and count.",
    ],
    solution: `WITH days AS (
  SELECT DISTINCT customer_id, order_date FROM orders
),
runs AS (
  SELECT customer_id, order_date,
         order_date - CAST(ROW_NUMBER() OVER (
           PARTITION BY customer_id ORDER BY order_date
         ) AS int) AS grp
  FROM days
)
SELECT DISTINCT customer_id
FROM runs
GROUP BY customer_id, grp
HAVING COUNT(*) >= 3;`,
    explanation:
      "Within a run of consecutive dates, both the date and the row number increase by exactly 1 per row, so their difference is a per-run constant. Grouping on it isolates each streak; HAVING filters streak length. The DISTINCT-dates CTE stops multiple same-day orders from inflating a streak.",
  },
  {
    id: "self-join-managers",
    title: "Employees Earning More Than Their Manager",
    difficulty: "easy",
    schema: `employees(emp_id, name, salary, manager_id)`,
    question: "Return employees whose salary exceeds their direct manager's salary.",
    hints: [
      "Self-join: the table plays both roles.",
      "Alias clearly — e for employee, m for manager.",
    ],
    solution: `SELECT e.name AS employee, e.salary,
       m.name AS manager, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary > m.salary;`,
    explanation:
      "One physical table, two logical roles. The inner join silently drops employees with NULL manager_id (the CEO) — usually wanted here; switch to LEFT JOIN when it isn't.",
  },
]
