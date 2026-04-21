export type SqlPrimitive = string | number | boolean | null;

export type SqlRow = Record<string, SqlPrimitive | unknown>;

export interface NaturalQueryRequest {
  query: string;
}

export interface NaturalQueryResponse {
  sql: string;
  explanation: string;
  /** Optional assistant-facing summary shown in chat */
  message?: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

export interface SchemaResponse {
  tables: SchemaTable[];
}

export interface ExecuteQueryRequest {
  sql: string;
}

export interface ExecuteQueryResponse {
  rows: SqlRow[];
}

export interface CompileQueryRequest {
  sql: string;
}

export interface CompileQueryResponse {
  valid: true;
  normalizedSql: string;
  statementType: "SELECT";
  readOnly: true;
}

export interface ApiErrorBody {
  error?: string;
  message?: string;
}
