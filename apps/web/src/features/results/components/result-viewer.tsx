"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultDataTable } from "./result-data-table";
import { useDashboardStore } from "@/store/dashboard-store";
import { useExecution } from "@/features/dashboard/providers/execution-provider";

export function ResultViewer({ embedded }: { embedded?: boolean }) {
  const rows = useDashboardStore((s) => s.resultRows);
  const exec = useExecution();

  const banner =
    exec.usedFallback && exec.error ? (
      <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
        Execute API failed ({exec.error}). Showing deterministic sample rows for the same column shape.
      </div>
    ) : null;

  const tableBlock = (
    <div className="min-h-0 flex-1 px-2 pb-3 pt-1">
      <ResultDataTable rows={rows ?? []} isLoading={exec.isLoading} />
    </div>
  );

  if (embedded) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {banner}
        {tableBlock}
      </div>
    );
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-zinc-200/80 dark:border-zinc-800">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm">Results</CardTitle>
        {rows ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{rows.length} rows returned</span>
        ) : null}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        {banner}
        {tableBlock}
      </CardContent>
    </Card>
  );
}
