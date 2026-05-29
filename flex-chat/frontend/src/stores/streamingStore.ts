import { create } from "zustand";

interface StreamingState {
  streamingIds: Set<number>;
  addStreaming: (id: number) => void;
  removeStreaming: (id: number) => void;
}

export const useStreamingStore = create<StreamingState>((set) => ({
  streamingIds: new Set(),
  addStreaming: (id) =>
    set((s) => ({ streamingIds: new Set(s.streamingIds).add(id) })),
  removeStreaming: (id) =>
    set((s) => {
      const n = new Set(s.streamingIds);
      n.delete(id);
      return { streamingIds: n };
    }),
}));