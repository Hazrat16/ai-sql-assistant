import type {
  ExecuteQueryResponse,
  NaturalQueryResponse,
  SchemaResponse,
} from "./types";

export const DUMMY_SCHEMA: SchemaResponse = {
  tables: [
    {
      name: "customers",
      columns: [
        { name: "id", type: "uuid", nullable: false },
        { name: "email", type: "text", nullable: false },
        { name: "created_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      name: "orders",
      columns: [
        { name: "id", type: "uuid", nullable: false },
        { name: "customer_id", type: "uuid", nullable: false },
        { name: "total_cents", type: "int", nullable: false },
        { name: "status", type: "text", nullable: false },
      ],
    },
    {
      name: "order_items",
      columns: [
        { name: "id", type: "uuid", nullable: false },
        { name: "order_id", type: "uuid", nullable: false },
        { name: "sku", type: "text", nullable: false },
        { name: "quantity", type: "int", nullable: false },
      ],
    },
  ],
};

export const DUMMY_NATURAL_RESPONSE: NaturalQueryResponse = {
  sql: `SELECT c.email, COUNT(o.id) AS order_count, SUM(o.total_cents) / 100.0 AS revenue_usd
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.email
ORDER BY revenue_usd DESC
LIMIT 25;`,
  explanation:
    "This query lists paying customers with how many completed orders they have and total revenue in dollars, sorted from highest revenue to lowest, capped at 25 rows.",
  message:
    "Here is SQL that ranks customers by paid order revenue. You can run it against your warehouse to validate top accounts.",
};

export const DUMMY_EXECUTE_RESULT: ExecuteQueryResponse = {
  rows: [
    { email: "alex@example.com", order_count: 12, revenue_usd: 4820.5 },
    { email: "sam@example.com", order_count: 9, revenue_usd: 3910.0 },
    { email: "jordan@example.com", order_count: 7, revenue_usd: 2844.25 },
    { email: "taylor@example.com", order_count: 6, revenue_usd: 2100.0 },
    { email: "casey@example.com", order_count: 5, revenue_usd: 1999.99 },
    { email: "riley@example.com", order_count: 4, revenue_usd: 1320.4 },
    { email: "morgan@example.com", order_count: 4, revenue_usd: 980.0 },
    { email: "quinn@example.com", order_count: 3, revenue_usd: 742.1 },
    { email: "avery@example.com", order_count: 3, revenue_usd: 610.0 },
    { email: "drew@example.com", order_count: 2, revenue_usd: 400.0 },
    { email: "blair@example.com", order_count: 2, revenue_usd: 355.5 },
    { email: "skyler@example.com", order_count: 1, revenue_usd: 120.0 },
  ],
};
