import type { PoolClient } from "pg";
import { loadEnv } from "../config/env.js";
import { pool } from "../db/pool.js";
import { AppError, describeCause } from "../utils/errors.js";
import { assertExternalDatabaseAllowed, withEphemeralPgConnection } from "./external-connection.service.js";

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface SchemaPayload {
  tables: SchemaTable[];
}

// Every user schema the connected role can see, not just `public` — hosted databases often
// keep their tables elsewhere (e.g. RNAcentral uses `rnacen`).
const INTROSPECTION_SQL = `
  SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable
  FROM information_schema.columns AS c
  JOIN information_schema.tables AS t
    ON t.table_schema = c.table_schema
   AND t.table_name = c.table_name
  WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
    AND c.table_schema NOT LIKE 'pg\\_toast%'
    AND c.table_schema NOT LIKE 'pg\\_temp\\_%'
    AND t.table_type = 'BASE TABLE'
  ORDER BY (c.table_schema <> 'public'), c.table_schema, c.table_name, c.ordinal_position;
`;

type IntrospectionRow = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
};

/** `public` tables keep their bare name; others are schema-qualified so the name is valid SQL as-is. */
function qualifiedTableName(schema: string, table: string): string {
  return schema === "public" ? table : `${schema}.${table}`;
}

function rowsToPayload(rows: IntrospectionRow[]): SchemaPayload {
  const byTable = new Map<string, SchemaColumn[]>();
  for (const row of rows) {
    const key = qualifiedTableName(row.table_schema, row.table_name);
    const cols = byTable.get(key) ?? [];
    cols.push({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
    });
    byTable.set(key, cols);
  }

  const tables: SchemaTable[] = [...byTable.entries()].map(([name, columns]) => ({
    name,
    columns,
  }));

  return { tables };
}

async function introspectWithClient(client: PoolClient): Promise<SchemaPayload> {
  const res = await client.query<IntrospectionRow>(INTROSPECTION_SQL);
  return rowsToPayload(res.rows);
}

function stubPublicSchema(): SchemaPayload {
  return {
    tables: [
      {
        name: "users",
        columns: [
          { name: "id", type: "integer", nullable: false },
          { name: "full_name", type: "text", nullable: true },
          { name: "email", type: "text", nullable: true },
          { name: "status", type: "text", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
      },
      {
        name: "orders",
        columns: [
          { name: "id", type: "integer", nullable: false },
          { name: "user_id", type: "integer", nullable: false },
          { name: "total_cents", type: "bigint", nullable: false },
          { name: "created_at", type: "timestamptz", nullable: true },
        ],
      },
    ],
  };
}

export type FetchSchemaOptions = {
  /** When set, introspect this database instead of the app pool (stub mode ignored). */
  databaseUrl?: string;
};

export async function fetchSchema(options?: FetchSchemaOptions): Promise<SchemaPayload> {
  const url = options?.databaseUrl?.trim();

  if (url) {
    assertExternalDatabaseAllowed();
    try {
      return await withEphemeralPgConnection(url, (client) => introspectWithClient(client));
    } catch (cause) {
      if (cause instanceof AppError) throw cause;
      throw new AppError("DATABASE_ERROR", `Failed to read external database schema: ${describeCause(cause)}`, 502, {
        cause,
        expose: true,
      });
    }
  }

  const env = loadEnv();
  if (env.STUB_DATABASE) {
    return stubPublicSchema();
  }

  const client = await pool.connect();
  try {
    return await introspectWithClient(client);
  } catch (cause) {
    throw new AppError("DATABASE_ERROR", `Failed to read database schema: ${describeCause(cause)}`, 502, { cause, expose: true });
  } finally {
    client.release();
  }
}
