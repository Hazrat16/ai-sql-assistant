"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/store/dashboard-store";

export function ExplanationPanel() {
  const explanation = useDashboardStore((s) => s.activeExplanation);
  const sql = useDashboardStore((s) => s.activeSql);
  const isLoading = useDashboardStore((s) =>
    s.messages.some((m) => m.role === "assistant" && m.status === "pending"),
  );

  return (
    <Card className="h-full min-h-0 border-zinc-200/80 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-sm">Explanation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {isLoading && !explanation ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[85%]" />
          </div>
        ) : explanation ? (
          <div>
            <p>{explanation}</p>
            {sql ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tip: match column names to the schema on the left when you connect a real database.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            After you generate SQL, a plain-language explanation will show here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
