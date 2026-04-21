"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCompileQuery } from "@/hooks/use-compile-query";
import { useDashboardStore } from "@/store/dashboard-store";
import { useExecution } from "@/features/dashboard/providers/execution-provider";

export function CompilePanel() {
  const activeSql = useDashboardStore((s) => s.activeSql);
  const setActiveQuery = useDashboardStore((s) => s.setActiveQuery);
  const setResultRows = useDashboardStore((s) => s.setResultRows);

  const [sqlDraft, setSqlDraft] = useState(() => activeSql ?? "");
  const [compileMessage, setCompileMessage] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  const { mutate: compileMutate, isLoading: isCompiling } = useCompileQuery();
  const { mutate: runMutate, isLoading: isRunning } = useExecution();

  const isEmpty = useMemo(() => sqlDraft.trim().length === 0, [sqlDraft]);

  async function handleCompile() {
    const { data, error } = await compileMutate(sqlDraft);
    if (error || !data) {
      setCompileError(error ?? "Compile failed");
      setCompileMessage(null);
      return;
    }

    setSqlDraft(data.normalizedSql);
    setActiveQuery(data.normalizedSql, "Compilation successful. SQL is valid and read-only.");
    setCompileError(null);
    setCompileMessage("Compile successful: SQL is valid, read-only, and ready to run.");
  }

  async function handleRun() {
    const result = await runMutate(sqlDraft);
    setResultRows(result.rows ?? []);
  }

  return (
    <Card className="h-full min-h-0 border-zinc-200/80 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm">SQL compiler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={sqlDraft}
          onChange={(e) => setSqlDraft(e.target.value)}
          placeholder="Paste SQL here to compile/validate before execution..."
          className="min-h-[140px]"
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSqlDraft(activeSql ?? "")}
            disabled={!activeSql || isCompiling || isRunning}
          >
            Use active SQL
          </Button>
          <Button type="button" variant="outline" onClick={() => void handleCompile()} disabled={isCompiling || isEmpty}>
            {isCompiling ? "Compiling..." : "Compile SQL"}
          </Button>
          <Button type="button" onClick={() => void handleRun()} disabled={isRunning || isCompiling || isEmpty}>
            {isRunning ? "Running..." : "Run SQL"}
          </Button>
        </div>

        {compileError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {compileError}
          </p>
        ) : null}
        {compileMessage ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            {compileMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
