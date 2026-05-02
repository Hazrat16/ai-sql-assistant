"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatabaseSchema } from "@/hooks/use-database-schema";
import { useConnectionStore } from "@/store/connection-store";

export function SchemaSidebar() {
  const { data, error, isLoading, usedFallback, refetch } = useDatabaseSchema();
  const externalDatabaseUrl = useConnectionStore((s) => s.externalDatabaseUrl);
  const setExternalDatabaseUrl = useConnectionStore((s) => s.setExternalDatabaseUrl);
  const [draftUrl, setDraftUrl] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const tables = useMemo(() => data?.tables ?? [], [data?.tables]);

  const toggle = (name: string) => {
    setOpen((s) => ({ ...s, [name]: !s[name] }));
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border-zinc-200/80 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm">Schema</CardTitle>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Refresh
        </button>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            External Postgres
          </div>
          <textarea
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="postgres://user:pass@host:5432/dbname"
            rows={2}
            spellCheck={false}
            autoComplete="off"
            className="mb-2 w-full resize-none rounded-md border border-zinc-200 bg-white px-2 py-1.5 font-mono text-[11px] text-zinc-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const u = draftUrl.trim();
                if (!u) return;
                setExternalDatabaseUrl(u);
              }}
            >
              Use this database
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setDraftUrl("");
                setExternalDatabaseUrl(null);
              }}
            >
              Reset to app DB
            </Button>
          </div>
          {externalDatabaseUrl ? (
            <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
              NL→SQL and Run use your linked URL (sent to this API only).
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Leave empty to use the server&apos;s default DATABASE_URL. Only postgres:// URLs.
            </p>
          )}
        </div>
        {usedFallback && error ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            {error}. Showing bundled sample schema.
          </p>
        ) : null}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <ul className="space-y-1">
            {tables.map((t) => {
              const expanded = open[t.name] ?? false;
              return (
                <li key={t.name} className="rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => toggle(t.name)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="text-xs text-zinc-500">{t.columns.length} cols</span>
                    <Chevron rotated={expanded} />
                  </button>
                  {expanded ? (
                    <div className="overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
                      <ul className="px-3 py-2 text-xs">
                        {t.columns.map((c) => (
                          <li key={c.name} className="flex justify-between gap-2 py-0.5 text-zinc-600 dark:text-zinc-400">
                            <span className="font-mono text-zinc-800 dark:text-zinc-200">{c.name}</span>
                            <span className="shrink-0 text-zinc-500">{c.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Chevron({ rotated }: { rotated: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${rotated ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
