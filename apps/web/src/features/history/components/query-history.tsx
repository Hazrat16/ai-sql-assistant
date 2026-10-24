"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboard-store";
import { useExecution } from "@/features/dashboard/providers/execution-provider";

export function QueryHistory({ embedded }: { embedded?: boolean }) {
  const history = useDashboardStore((s) => s.history);
  const setActiveQuery = useDashboardStore((s) => s.setActiveQuery);
  const setResultRows = useDashboardStore((s) => s.setResultRows);
  const appendMessage = useDashboardStore((s) => s.appendMessage);
  const exec = useExecution();

  const rerun = async (item: (typeof history)[number]) => {
    setActiveQuery(item.sql, item.explanation);
    setResultRows(null);
    appendMessage({
      role: "assistant",
      content: `Re-running saved query:\n\n“${item.naturalLanguage}”`,
      sql: item.sql,
      explanation: item.explanation,
      status: "done",
    });
    const res = await exec.mutate(item.sql);
    setResultRows(res.rows ?? []);
  };

  const list =
    history.length === 0 ? (
      <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400">Saved queries appear here for quick re-run.</p>
    ) : (
      <ul className="space-y-2">
        {history.map((h) => (
          <li key={h.id} className="rounded-lg border border-zinc-200/80 p-2 text-xs dark:border-zinc-800">
            <p className="line-clamp-2 font-medium text-zinc-800 dark:text-zinc-100">{h.naturalLanguage}</p>
            <p className="mt-1 line-clamp-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{h.sql}</p>
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                type="button"
                disabled={exec.isLoading}
                onClick={() => void rerun(h)}
              >
                Re-run
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1">{list}</div>;
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-zinc-200/80 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm">Query history</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{list}</CardContent>
    </Card>
  );
}
