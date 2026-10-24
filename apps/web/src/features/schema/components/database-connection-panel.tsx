"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConnectionStore } from "@/store/connection-store";

export function DatabaseConnectionPanel() {
  const externalDatabaseUrl = useConnectionStore((s) => s.externalDatabaseUrl);
  const setExternalDatabaseUrl = useConnectionStore((s) => s.setExternalDatabaseUrl);
  const [draftUrl, setDraftUrl] = useState("");

  return (
    <div className="space-y-3 px-1">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Point NL→SQL and Run at another Postgres database (optional). Uses your backend&apos;s{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">/schema/connect</code> flow.
      </p>
      <textarea
        value={draftUrl}
        onChange={(e) => setDraftUrl(e.target.value)}
        placeholder="postgres://user:pass@host:5432/dbname"
        rows={4}
        spellCheck={false}
        autoComplete="off"
        className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-2 py-2 font-mono text-[11px] text-zinc-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="text-xs"
          onClick={() => {
            const u = draftUrl.trim();
            if (!u) return;
            setExternalDatabaseUrl(u);
          }}
        >
          Apply URL
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-xs"
          onClick={() => {
            setDraftUrl("");
            setExternalDatabaseUrl(null);
          }}
        >
          Use server default
        </Button>
      </div>
      {externalDatabaseUrl ? (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Linked URL is active until reset.</p>
      ) : null}
    </div>
  );
}
