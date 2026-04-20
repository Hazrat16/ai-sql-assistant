"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SqlRow } from "@/lib/api/types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sql?: string;
  explanation?: string;
  status: "pending" | "done" | "error";
  error?: string;
}

export interface HistoryEntry {
  id: string;
  naturalLanguage: string;
  sql: string;
  explanation: string;
  createdAt: number;
}

interface DashboardState {
  messages: ChatMessage[];
  activeSql: string | null;
  activeExplanation: string | null;
  resultRows: SqlRow[] | null;
  history: HistoryEntry[];
  appendMessage: (message: Omit<ChatMessage, "id" | "status"> & { id?: string; status?: ChatMessage["status"] }) => string;
  patchMessage: (id: string, patch: Partial<ChatMessage>) => void;
  setActiveQuery: (sql: string | null, explanation: string | null) => void;
  setResultRows: (rows: SqlRow[] | null) => void;
  addHistory: (entry: Omit<HistoryEntry, "id" | "createdAt">) => void;
  clearChat: () => void;
}

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      messages: [],
      activeSql: null,
      activeExplanation: null,
      resultRows: null,
      history: [],

      appendMessage: (message) => {
        const id = message.id ?? randomId();
        const next: ChatMessage = {
          id,
          role: message.role,
          content: message.content,
          sql: message.sql,
          explanation: message.explanation,
          status: message.status ?? "done",
          error: message.error,
        };
        set((s) => ({ messages: [...s.messages, next] }));
        return id;
      },

      patchMessage: (id, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      setActiveQuery: (sql, explanation) =>
        set({ activeSql: sql, activeExplanation: explanation }),

      setResultRows: (rows) => set({ resultRows: rows }),

      addHistory: (entry) =>
        set((s) => {
          const item: HistoryEntry = {
            id: randomId(),
            createdAt: Date.now(),
            ...entry,
          };
          const withoutDup = s.history.filter(
            (h) =>
              !(
                h.naturalLanguage === item.naturalLanguage &&
                h.sql === item.sql
              ),
          );
          return { history: [item, ...withoutDup].slice(0, 50) };
        }),

      clearChat: () => set({ messages: [], activeSql: null, activeExplanation: null, resultRows: null }),
    }),
    {
      name: "ai-sql-assistant-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }),
    },
  ),
);
