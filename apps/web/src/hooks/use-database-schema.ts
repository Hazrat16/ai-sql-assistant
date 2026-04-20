"use client";

import { useCallback, useEffect, useState } from "react";
import { getSchema } from "@/lib/api/client";
import { DUMMY_SCHEMA } from "@/lib/api/dummy-data";
import { isApiConfigured } from "@/lib/api/config";
import type { SchemaResponse } from "@/lib/api/types";

export function useDatabaseSchema() {
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
      const result = await getSchema();
      setData(result);
      return result;
    } catch (e) {
      setData(DUMMY_SCHEMA);
      setUsedFallback(true);
      setError(e instanceof Error ? e.message : "Failed to load schema");
      return DUMMY_SCHEMA;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refetch();
    });
  }, [refetch]);

  return { data, error, isLoading, usedFallback, refetch };
}
