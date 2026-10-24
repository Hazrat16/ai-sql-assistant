import { describe, expect, it } from "vitest";
import { AppError } from "../utils/errors.js";
import { assertExecutableSelect, compileUserSql } from "./query-validation.service.js";

function rejectionOf(sql: string): AppError {
  try {
    assertExecutableSelect(sql);
  } catch (err) {
    if (err instanceof AppError) return err;
    throw err;
  }
  throw new Error(`Expected SQL to be rejected: ${sql}`);
}

describe("assertExecutableSelect — allowed queries", () => {
  it.each([
    ["simple select", "SELECT id, email FROM users"],
    ["trailing semicolon", "SELECT id FROM users;"],
    ["where + order + limit", "SELECT id FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 10"],
    ["join with aliases", "SELECT u.id, o.total_cents FROM users u JOIN orders o ON o.user_id = u.id"],
    ["aggregate", "SELECT user_id, SUM(total_cents) AS total FROM orders GROUP BY user_id HAVING SUM(total_cents) > 100"],
    ["read-only CTE", "WITH big AS (SELECT * FROM orders WHERE total_cents > 1000) SELECT COUNT(*) FROM big"],
    ["union", "SELECT id FROM users UNION SELECT user_id FROM orders"],
    ["subquery", "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)"],
    ["schema-qualified table", "SELECT display_name FROM rnacen.rnc_database LIMIT 5"],
    [
      "ordinary functions",
      "SELECT lower(email), date_trunc('day', created_at), COALESCE(status, 'none'), now(), count(*) FROM users GROUP BY 1, 2, 3",
    ],
    ["functions with blocked-looking names", "SELECT lower(full_name), long_name_fn(1) FROM users"],
  ])("accepts %s", (_label, sql) => {
    expect(() => assertExecutableSelect(sql)).not.toThrow();
  });

  it("returns the SQL unchanged when no alias rewrite is needed", () => {
    expect(assertExecutableSelect("  SELECT id FROM users  ")).toBe("SELECT id FROM users");
  });

  it("rewrites tablename.column to the alias the query introduced", () => {
    const out = assertExecutableSelect("SELECT users.email FROM users u");
    expect(out).toMatch(/"u"\.email/);
    expect(out).not.toMatch(/users\.email/);
  });
});

describe("assertExecutableSelect — rejected queries", () => {
  it.each([
    ["DELETE", "DELETE FROM users"],
    ["UPDATE", "UPDATE users SET email = 'x'"],
    ["INSERT", "INSERT INTO users (email) VALUES ('x')"],
    ["DROP", "DROP TABLE users"],
    ["CREATE", "CREATE TABLE t (id int)"],
    ["ALTER", "ALTER TABLE users ADD COLUMN x int"],
    ["TRUNCATE", "TRUNCATE users"],
    ["GRANT", "GRANT ALL ON users TO public"],
    ["COPY", "COPY users TO '/tmp/users.csv'"],
    ["VACUUM", "VACUUM users"],
  ])("rejects %s", (_label, sql) => {
    const err = rejectionOf(sql);
    expect(["FORBIDDEN_SQL", "INVALID_SQL"]).toContain(err.code);
  });

  it("rejects multiple statements", () => {
    expect(rejectionOf("SELECT 1; DROP TABLE users").code).toBe("FORBIDDEN_SQL");
  });

  it("rejects a SELECT piggybacking a second SELECT", () => {
    expect(rejectionOf("SELECT 1; SELECT 2").code).toBe("FORBIDDEN_SQL");
  });

  it("rejects SELECT … INTO (creates a table)", () => {
    expect(rejectionOf("SELECT * INTO new_users FROM users").code).toBe("FORBIDDEN_SQL");
  });

  it("rejects a writable CTE", () => {
    const err = rejectionOf("WITH d AS (DELETE FROM users RETURNING *) SELECT * FROM d");
    expect(["FORBIDDEN_SQL", "INVALID_SQL"]).toContain(err.code);
  });

  it.each([
    ["pg_sleep", "SELECT pg_sleep(60)"],
    ["pg_terminate_backend", "SELECT pg_terminate_backend(pid) FROM pg_stat_activity"],
    ["pg_read_file", "SELECT pg_read_file('/etc/passwd')"],
    ["dblink", "SELECT * FROM dblink('host=evil', 'SELECT 1')"],
    ["set_config", "SELECT set_config('statement_timeout', '0', false)"],
    ["lo_import", "SELECT lo_import('/etc/passwd')"],
    ["query_to_xml (runs SQL from a string)", "SELECT query_to_xml('SELECT pg_read_file(''/etc/passwd'')', true, false, '')"],
    ["pg_advisory_lock", "SELECT pg_advisory_lock(1)"],
    ["schema-qualified call", "SELECT pg_catalog.pg_sleep(60)"],
    ["call nested in a WHERE subquery", "SELECT id FROM users WHERE id IN (SELECT pg_sleep(60)::int)"],
    ["call inside a CTE", "WITH x AS (SELECT pg_read_file('/etc/passwd') AS f) SELECT f FROM x"],
    ["call in a UNION branch", "SELECT 1 UNION SELECT pg_terminate_backend(1)::int"],
    ["upper-case name", "SELECT PG_SLEEP(60)"],
  ])("rejects dangerous function %s", (_label, sql) => {
    expect(rejectionOf(sql).code).toBe("FORBIDDEN_SQL");
  });

  it("rejects empty input", () => {
    expect(rejectionOf("   ").code).toBe("VALIDATION_ERROR");
  });

  it("rejects unparseable SQL", () => {
    expect(rejectionOf("SELEC id FROM").code).toBe("INVALID_SQL");
  });

  it("strips NUL bytes before validating", () => {
    expect(() => assertExecutableSelect("SELECT id\u0000 FROM users")).not.toThrow();
  });
});

describe("compileUserSql", () => {
  it("reports a valid read-only SELECT", () => {
    expect(compileUserSql("SELECT 1")).toEqual({
      valid: true,
      normalizedSql: "SELECT 1",
      statementType: "SELECT",
      readOnly: true,
    });
  });
});
