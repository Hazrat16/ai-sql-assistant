"use client";

import { useCallback, useEffect, useState } from "react";
import { getSchema, postSchemaConnect } from "@/lib/api/client";
import { DUMMY_SCHEMA } from "@/lib/api/dummy-data";
import { isApiConfigured } from "@/lib/api/config";
import { useConnectionStore } from "@/store/connection-store";
import type { SchemaResponse } from "@ai-sql-assistant/shared";

export function useDatabaseSchema() {
  const externalDatabaseUrl = useConnectionStore((s) => s.externalDatabaseUrl);
  const [data, setData] = useState<SchemaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUsedFallback(false);
    try {
      if (!isApiConfigured()) {
        setData(DUMMY_SCHEMA);
        setUsedFallback(true);
        return DUMMY_SCHEMA;
      }
      const result = externalDatabaseUrl
        ? await postSchemaConnect({ databaseUrl: externalDatabaseUrl })
        : await getSchema();
      setData(result);
      return result;
    } catch (e) {
      // Don't show the bundled sample schema here: after a failed connect it would look like the real database.
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to load schema");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [externalDatabaseUrl]);

  useEffect(() => {
    queueMicrotask(() => {
      void refetch();
    });
  }, [refetch]);

  return { data, error, isLoading, usedFallback, refetch };
}
