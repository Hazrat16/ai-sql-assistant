"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { DatabaseConnectionPanel } from "@/features/schema/components/database-connection-panel";
import { SchemaTablesPanel } from "@/features/schema/components/schema-tables-panel";
import { QueryHistory } from "@/features/history/components/query-history";
type SidebarPanel = "tables" | "database" | "history";

const NAV: { id: SidebarPanel; label: string }[] = [
  { id: "tables", label: "Tables" },
  { id: "database", label: "Database" },
  { id: "history", label: "History" },
];

export function AppSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const [panel, setPanel] = useState<SidebarPanel>("tables");

  function select(next: SidebarPanel) {
    setPanel(next);
    onNavigate?.();
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white dark:bg-zinc-950", className)}>
      <div className="shrink-0 border-b border-zinc-200 px-2 py-3 dark:border-zinc-800">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Workspace
        </p>
        <nav className="mt-2 grid grid-cols-3 gap-1" aria-label="Workspace sections">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => select(id)}
              className={cn(
                "rounded-lg px-2 py-2 text-center text-[11px] font-medium transition-colors",
                panel === id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-3 pt-1">
        {panel === "tables" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <SchemaTablesPanel />
          </div>
        ) : null}
        {panel === "database" ? (
          <div className="min-h-0 overflow-y-auto">
            <DatabaseConnectionPanel />
          </div>
        ) : null}
        {panel === "history" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <QueryHistory embedded />
          </div>
        ) : null}
      </div>
    </div>
  );
}
