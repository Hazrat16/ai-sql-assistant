"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SqlCodeBlockProps {
  sql: string;
  onRun?: () => void;
  isRunning?: boolean;
}

export function SqlCodeBlock({ sql, onRun, isRunning }: SqlCodeBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Generated SQL
        </span>
        {onRun ? (
          <Button size="sm" variant="secondary" type="button" onClick={onRun} disabled={isRunning}>
            {isRunning ? "Running…" : "Run query"}
          </Button>
        ) : null}
      </div>
      <pre className="max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-3 text-xs leading-relaxed text-emerald-100 dark:border-zinc-800">
        <code>{sql}</code>
      </pre>
    </motion.div>
  );
}
