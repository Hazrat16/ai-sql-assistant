"use client";

import { useCallback, useState } from "react";
import { postExecuteQuery } from "@/lib/api/client";
import { DUMMY_EXECUTE_RESULT } from "@/lib/api/dummy-data";
import { isApiConfigured } from "@/lib/api/config";
import { useConnectionStore } from "@/store/connection-store";
import type { ExecuteQueryResponse, SqlRow } from "@ai-sql-assistant/shared";

export function useExecuteQuery() {
  const [data, setData] = useState<ExecuteQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (sql: string): Promise<ExecuteQueryResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        const rows = filterDummyRows(sql);
        const result = { rows };
        setData(result);
        return result;
      }
      const databaseUrl = useConnectionStore.getState().externalDatabaseUrl ?? undefined;
      const result = await postExecuteQuery({
        sql,
        ...(databaseUrl ? { databaseUrl } : {}),
      });
      setData(result);
      return result;
    } catch (e) {
      // Never substitute sample rows for a real failure — they look like genuine results.
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to execute SQL");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, error, isLoading, mutate, reset };
}

/** When using dummy data, return fewer rows for LIMIT-like prompts */
function filterDummyRows(sql: string): SqlRow[] {
  const limitMatch = sql.match(/\blimit\s+(\d+)/i);
  const limit = limitMatch ? Math.min(100, Math.max(1, Number(limitMatch[1]))) : 25;
  return DUMMY_EXECUTE_RESULT.rows.slice(0, limit);
}
