"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useExecuteQuery } from "@/hooks/use-execute-query";

type ExecutionContextValue = ReturnType<typeof useExecuteQuery>;

const ExecutionContext = createContext<ExecutionContextValue | null>(null);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const value = useExecuteQuery();
  return <ExecutionContext.Provider value={value}>{children}</ExecutionContext.Provider>;
}

export function useExecution() {
  const ctx = useContext(ExecutionContext);
  if (!ctx) {
    throw new Error("useExecution must be used within ExecutionProvider");
  }
  return ctx;
}
