"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { ExplanationPanel } from "@/features/explanation/components/explanation-panel";
import { ResultViewer } from "@/features/results/components/result-viewer";
import { CompilePanel } from "@/features/compile/components/compile-panel";
import { ExecutionProvider } from "@/features/dashboard/providers/execution-provider";
import { isApiConfigured } from "@/lib/api/config";
import { cn } from "@/lib/utils/cn";

function DashboardInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outputTab, setOutputTab] = useState<"results" | "explain" | "compile">("results");

  return (
    <div className="flex h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="workspace-sidebar"
          >
            Sidebar
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">AI SQL Assistant</h1>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {isApiConfigured() ? "API connected" : "Demo mode"}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="relative flex min-h-0 flex-1">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          id="workspace-sidebar"
          className={cn(
            "fixed bottom-0 left-0 top-14 z-50 flex w-[min(100vw-3rem,288px)] flex-col border-r border-zinc-200 bg-white shadow-xl transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-0 lg:w-[272px] lg:min-w-[272px] lg:max-w-[272px] lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <AppSidebar onNavigate={() => setSidebarOpen(false)} className="border-0" />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3">
          <section className="flex min-h-0 min-w-0 flex-[3] flex-col">
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-zinc-200/90 dark:border-zinc-800">
              <CardContent className="flex min-h-0 flex-1 flex-col p-4">
                <ChatPanel />
              </CardContent>
            </Card>
          </section>

          <section className="flex min-h-0 flex-[2] flex-col lg:max-h-[min(42vh,420px)]">
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-zinc-200/90 dark:border-zinc-800">
              <div className="flex shrink-0 gap-1 border-b border-zinc-200 px-2 pt-2 dark:border-zinc-800">
                {(
                  [
                    ["results", "Results"],
                    ["explain", "Explain"],
                    ["compile", "Compile"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOutputTab(id)}
                    className={cn(
                      "rounded-t-md px-3 py-2 text-xs font-medium transition-colors",
                      outputTab === id
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                {outputTab === "results" ? <ResultViewer embedded /> : null}
                {outputTab === "explain" ? <ExplanationPanel embedded /> : null}
                {outputTab === "compile" ? <CompilePanel embedded /> : null}
              </CardContent>
            </Card>
          </section>
        </div>
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
