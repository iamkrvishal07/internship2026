import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PendingMessage = {
  tempId: number;
  chatId: number;
  content: string;
  contentType: string;
  createdAt: string;
};

interface PendingMessagesStore {
  pending: PendingMessage[];
  addPending: (msg: PendingMessage) => void;
  removePending: (tempId: number) => void;
  clearAll: () => void;
}

export const usePendingMessagesStore = create<PendingMessagesStore>()(
  persist(
    (set) => ({
      pending: [],

      addPending: (msg) =>
        set((s) => ({
          pending: [...s.pending, msg],
        })),

      removePending: (tempId) =>
        set((s) => ({
          pending: s.pending.filter((m) => m.tempId !== tempId),
        })),

      clearAll: () => set({ pending: [] }),
    }),
    {
      name: "pending-messages", 
    },
  ),
);