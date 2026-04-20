"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { SqlRow } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultDataTableProps {
  rows: SqlRow[];
  isLoading?: boolean;
}

export function ResultDataTable({ rows, isLoading }: ResultDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<SqlRow, unknown>[]>(() => {
    if (!rows.length) return [];
    const keys = Object.keys(rows[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => formatCell(info.getValue()),
    }));
  }, [rows]);

  // TanStack Table returns unstable function references; safe here because rendering is driven by table state.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable is the supported integration API
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-zinc-500 dark:text-zinc-400">
        Run a query to see rows here.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-zinc-100/95 backdrop-blur dark:bg-zinc-900/95">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIndicator sorted={header.column.getIsSorted()} />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-zinc-50/80 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/40">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-zinc-100 px-3 py-2 font-mono text-[11px] text-zinc-800 dark:border-zinc-900 dark:text-zinc-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <span className="text-zinc-400">↕</span>;
  return <span>{sorted === "asc" ? "↑" : "↓"}</span>;
}

function formatCell(value: unknown) {
  if (value === null || value === undefined) return "∅";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
