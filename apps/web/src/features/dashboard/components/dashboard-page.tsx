"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const clearChat = useDashboardStore((s) => s.clearChat);
  const nlLoading = useDashboardStore((s) =>
    s.messages.some((m) => m.role === "assistant" && m.status === "pending"),
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
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
            <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">AI SQL Assistant</h1>
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

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <AnimatePresence>
          {sidebarOpen ? (
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}
        </AnimatePresence>

        <aside
          id="app-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex w-[min(100%,320px)] -translate-x-full flex-col gap-3 border-r border-zinc-200 bg-zinc-50 p-3 transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-0 lg:w-[300px] lg:translate-x-0 lg:flex-shrink-0 ${
            sidebarOpen ? "translate-x-0" : ""
          }`}
        >
          <div className="min-h-0 flex-1 overflow-hidden">
            <SchemaSidebar />
          </div>
          <div className="h-[38%] min-h-[180px] overflow-hidden">
            <QueryHistory />
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:max-w-[min(720px,52%)]">
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Conversation
                </div>
                <ChatPanel />
              </CardContent>
            </Card>
          </section>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-1">
            <div className="min-h-[180px] shrink-0 lg:min-h-0 lg:flex-[0.27]">
              <ExplanationPanel />
            </div>
            <div className="min-h-[220px] shrink-0 lg:min-h-0 lg:flex-[0.33]">
              <CompilePanel />
            </div>
            <div className="min-h-[240px] lg:flex-[0.4]">
              <ResultViewer />
            </div>
          </section>
        </main>
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
