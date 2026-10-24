"use client";

import { cn } from "@/lib/utils/cn";

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "chat-skeleton-shimmer rounded-md bg-zinc-200/90 dark:bg-zinc-800/90",
        className,
      )}
      aria-hidden
    />
  );
}

/** Rich placeholder while the NL→SQL API request is in flight */
export function AssistantLoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite" aria-label="Generating SQL response">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 dark:bg-emerald-400/50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-emerald-800 dark:text-emerald-300">
          Generating SQL
        </span>
        <span className="flex gap-1 pt-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 animate-bounce rounded-full bg-emerald-600/70 dark:bg-emerald-400/70"
              style={{ animationDelay: `${i * 120}ms`, animationDuration: "0.6s" }}
            />
          ))}
        </span>
      </div>

      <div className="space-y-2.5">
        <ShimmerBar className="h-3.5 w-[94%]" />
        <ShimmerBar className="h-3.5 w-[71%]" />
        <ShimmerBar className="h-3.5 w-[83%]" />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50/90 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/90">
        <div className="mb-3 flex flex-wrap gap-2">
          <ShimmerBar className="h-7 w-[4.5rem] rounded-md" />
          <ShimmerBar className="h-7 w-[5rem] rounded-md" />
        </div>
        <div className="space-y-2 rounded-md border border-zinc-200/80 bg-white/60 px-3 py-2.5 dark:border-zinc-700/80 dark:bg-zinc-900/40">
          <ShimmerBar className="h-2.5 w-full rounded-sm" />
          <ShimmerBar className="h-2.5 w-[96%] rounded-sm" />
          <ShimmerBar className="h-2.5 w-[88%] rounded-sm" />
          <ShimmerBar className="h-2.5 w-[62%] rounded-sm" />
        </div>
      </div>

      <p className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
        Loading schema context and calling the model — typically a few seconds.
      </p>
    </div>
  );
}
