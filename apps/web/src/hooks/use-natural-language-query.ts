"use client";

import { useCallback, useState } from "react";
import { postNaturalQuery } from "@/lib/api/client";
import { DUMMY_NATURAL_RESPONSE } from "@/lib/api/dummy-data";
import { isApiConfigured } from "@/lib/api/config";
import type { NaturalQueryResponse } from "@/lib/api/types";

export function useNaturalLanguageQuery() {
  const [data, setData] = useState<NaturalQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const mutate = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setUsedFallback(false);
    try {
      if (!isApiConfigured()) {
        const fallback = { ...DUMMY_NATURAL_RESPONSE };
        setData(fallback);
        setUsedFallback(true);
        return { data: fallback, error: null as string | null, usedFallback: true };
      }
      const result = await postNaturalQuery({ query });
      setData(result);
      return { data: result, error: null as string | null, usedFallback: false };
    } catch (e) {
      const fallback = { ...DUMMY_NATURAL_RESPONSE };
      setData(fallback);
      setUsedFallback(true);
      const message = e instanceof Error ? e.message : "Failed to generate SQL";
      setError(message);
      return { data: fallback, error: message, usedFallback: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setUsedFallback(false);
  }, []);

  return { data, error, isLoading, usedFallback, mutate, reset };
}
