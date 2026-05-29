import { create } from "zustand";

interface PresenceStore {
  onlineUserIds: Set<number>;
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  isOnline: (userId: number) => boolean;
}

export const usePresenceStore = create<PresenceStore>((set, get) => ({
  onlineUserIds: new Set(),

  setOnline: (userId) =>
    set((s) => ({
      onlineUserIds: new Set([...s.onlineUserIds, userId]),
    })),

  setOffline: (userId) =>
    set((s) => {
      const updated = new Set(s.onlineUserIds);
      updated.delete(userId);
      return { onlineUserIds: updated };
    }),

  isOnline: (userId) => get().onlineUserIds.has(userId),
}));