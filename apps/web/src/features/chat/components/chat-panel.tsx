"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { useDashboardStore } from "@/store/dashboard-store";
import { useNaturalLanguageQuery } from "@/hooks/use-natural-language-query";
import { useExecution } from "@/features/dashboard/providers/execution-provider";
import { useCompileQuery } from "@/hooks/use-compile-query";

export function ChatPanel() {
  const messages = useDashboardStore((s) => s.messages);
  const appendMessage = useDashboardStore((s) => s.appendMessage);
  const patchMessage = useDashboardStore((s) => s.patchMessage);
  const setActiveQuery = useDashboardStore((s) => s.setActiveQuery);
  const setResultRows = useDashboardStore((s) => s.setResultRows);
  const addHistory = useDashboardStore((s) => s.addHistory);
  const clearChat = useDashboardStore((s) => s.clearChat);

  const { mutate: nlMutate, isLoading: nlLoading, error: nlError, usedFallback: nlFallback } =
    useNaturalLanguageQuery();
  const { mutate: execMutate, isLoading: execLoading, reset: resetExecution } = useExecution();
  const { mutate: compileMutate, isLoading: compileLoading } = useCompileQuery();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, nlLoading, execLoading]);

  const handleSend = useCallback(async () => {
    const text = inputRef.current?.value.trim();
    if (!text || nlLoading) return;

    appendMessage({ role: "user", content: text, status: "done" });
    if (inputRef.current) inputRef.current.value = "";

    const assistantId = appendMessage({
      role: "assistant",
      content: "Thinking through your question and drafting SQL…",
      status: "pending",
    });

    const { data: result, error: genError } = await nlMutate(text);

    patchMessage(assistantId, {
      status: "done",
      content:
        result.message ??
        "I've generated SQL based on your request. Review it, then run it to see results.",
      sql: result.sql,
      explanation: result.explanation,
      error: genError ?? undefined,
    });

    setActiveQuery(result.sql, result.explanation);
    setResultRows(null);
    resetExecution();

    addHistory({
      naturalLanguage: text,
      sql: result.sql,
      explanation: result.explanation,
    });
  }, [
    addHistory,
    appendMessage,
    nlLoading,
    nlMutate,
    patchMessage,
    resetExecution,
    setActiveQuery,
    setResultRows,
  ]);

  const handleRunSql = useCallback(
    async (sql: string) => {
      setActiveQuery(sql, useDashboardStore.getState().activeExplanation);
      const res = await execMutate(sql);
      setResultRows(res.rows ?? []);
    },
    [execMutate, setActiveQuery, setResultRows],
  );

  const handleCompileSql = useCallback(
    async (sql: string) => {
      const { data, error } = await compileMutate(sql);
      if (error || !data) {
        appendMessage({
          role: "assistant",
          status: "done",
          content: `Compile failed: ${error ?? "Unknown error"}`,
          error: error ?? "Compile failed",
        });
        return;
      }

      appendMessage({
        role: "assistant",
        status: "done",
        content:
          "Compile successful. SQL is valid, read-only, and safe to execute. I normalized the query text before validation.",
        sql: data.normalizedSql,
      });
      setActiveQuery(data.normalizedSql, "Compilation successful. Ready to run.");
    },
    [appendMessage, compileMutate, setActiveQuery],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-800">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Chat
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            clearChat();
            resetExecution();
          }}
          disabled={nlLoading}
        >
          Clear
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400"
          >
            Ask in plain language, for example: “Top 10 customers by revenue last quarter.”
          </motion.div>
        ) : null}
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            onRunSql={handleRunSql}
            onCompileSql={handleCompileSql}
            isExecuting={execLoading}
            isCompiling={compileLoading}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
        {nlFallback && nlError ? (
          <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            API unavailable ({nlError}). Showing sample SQL so you can still explore the UI.
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Textarea ref={inputRef} placeholder="Describe what you want to query…" className="min-h-[72px] flex-1" />
          <Button type="button" className="shrink-0 sm:mb-0.5" onClick={() => void handleSend()} disabled={nlLoading}>
            {nlLoading ? "Generating…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
