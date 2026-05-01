"use client";

import type { ChatMessage as ChatMessageModel } from "@/store/dashboard-store";
import { SqlCodeBlock } from "./sql-code-block";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageProps {
  message: ChatMessageModel;
  onRunSql?: (sql: string) => void;
  onCompileSql?: (sql: string) => void;
  isExecuting?: boolean;
  isCompiling?: boolean;
}

export function ChatMessage({ message, onRunSql, onCompileSql, isExecuting, isCompiling }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(100%,52rem)] space-y-3 rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "border border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        }`}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {isUser ? "You" : "Assistant"}
        </p>
        {message.status === "pending" && !isUser ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-[75%]" />
            <Skeleton className="h-3 w-[66%]" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                {message.error}
              </p>
            ) : null}
            {!isUser && message.sql ? (
              <SqlCodeBlock
                sql={message.sql}
                onRun={onRunSql ? () => onRunSql(message.sql!) : undefined}
                onCompile={onCompileSql ? () => onCompileSql(message.sql!) : undefined}
                isRunning={isExecuting}
                isCompiling={isCompiling}
              />
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
