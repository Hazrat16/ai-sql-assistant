"use client";

import { useCallback, useState } from "react";
import { postCompileQuery } from "@/lib/api/client";
import { isApiConfigured } from "@/lib/api/config";
import type { CompileQueryResponse } from "@/lib/api/types";

export function useCompileQuery() {
  const [data, setData] = useState<CompileQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (sql: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("API is not configured");
      }
      const result = await postCompileQuery({ sql });
      setData(result);
      return { data: result, error: null as string | null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to compile SQL";
      setError(msg);
      return { data: null, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, mutate };
}
