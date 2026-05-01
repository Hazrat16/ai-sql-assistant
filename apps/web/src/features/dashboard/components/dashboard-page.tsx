"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { SchemaSidebar } from "@/features/schema/components/schema-sidebar";
import { QueryHistory } from "@/features/history/components/query-history";
import { ExplanationPanel } from "@/features/explanation/components/explanation-panel";
import { ResultViewer } from "@/features/results/components/result-viewer";
import { CompilePanel } from "@/features/compile/components/compile-panel";
import { ExecutionProvider } from "@/features/dashboard/providers/execution-provider";
import { useDashboardStore } from "@/store/dashboard-store";
import { isApiConfigured } from "@/lib/api/config";

function DashboardInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<"results" | "explain" | "compile">("results");
  const clearChat = useDashboardStore((s) => s.clearChat);
  const nlLoading = useDashboardStore((s) =>
    s.messages.some((m) => m.role === "assistant" && m.status === "pending"),
  );

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            Menu
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold sm:text-base">AI SQL Assistant</h1>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {isApiConfigured() ? "Connected to API" : "Demo mode — set NEXT_PUBLIC_API_URL to reach your backend"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={clearChat} disabled={nlLoading}>
            Clear chat
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[280px_minmax(420px,1fr)_minmax(320px,420px)] lg:gap-3 lg:p-3">
        <aside
          id="app-sidebar"
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } min-h-0 flex-col gap-3 border-b border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 lg:flex lg:border lg:rounded-xl`}
        >
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Data</div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <SchemaSidebar />
          </div>
          <div className="h-[36%] min-h-[170px] overflow-hidden">
            <QueryHistory />
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 lg:p-0">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Ask SQL</div>
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
              <CardContent className="flex min-h-0 flex-1 flex-col p-4">
                <ChatPanel />
              </CardContent>
            </Card>
          </section>
        </main>

        <section className="flex min-h-0 min-w-0 flex-col gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800 lg:border-0 lg:p-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Output</div>
            <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                className={`rounded px-2 py-1 ${activeRightPanel === "results" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-300"}`}
                onClick={() => setActiveRightPanel("results")}
              >
                Results
              </button>
              <button
                type="button"
                className={`rounded px-2 py-1 ${activeRightPanel === "explain" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-300"}`}
                onClick={() => setActiveRightPanel("explain")}
              >
                Explain
              </button>
              <button
                type="button"
                className={`rounded px-2 py-1 ${activeRightPanel === "compile" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-300"}`}
                onClick={() => setActiveRightPanel("compile")}
              >
                Compile
              </button>
            </div>
          </div>

          <div className="min-h-[260px] flex-1">
            {activeRightPanel === "results" ? <ResultViewer /> : null}
            {activeRightPanel === "explain" ? <ExplanationPanel /> : null}
            {activeRightPanel === "compile" ? <CompilePanel /> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <ExecutionProvider>
      <DashboardInner />
    </ExecutionProvider>
  );
}
