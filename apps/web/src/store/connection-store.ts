"use client";

import { create } from "zustand";

type ConnectionState = {
  /** Active PostgreSQL URL for schema / NL→SQL / execute (not persisted — refresh clears). */
  externalDatabaseUrl: string | null;
  setExternalDatabaseUrl: (url: string | null) => void;
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  externalDatabaseUrl: null,
  setExternalDatabaseUrl: (url) =>
    set({
      externalDatabaseUrl: typeof url === "string" && url.trim().length ? url.trim() : null,
    }),
}));
