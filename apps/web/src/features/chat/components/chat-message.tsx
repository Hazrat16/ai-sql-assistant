"use client";

import { motion } from "framer-motion";
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
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[min(100%,52rem)] space-y-3 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-600 text-white"
            : "border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        }`}
      >
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
    </motion.article>
  );
}
