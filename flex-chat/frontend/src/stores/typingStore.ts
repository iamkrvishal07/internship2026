import { create } from "zustand";

interface TypingStore {
  typingByChatId: Record<number, string>; 
  setTyping: (chatId: number, userName: string) => void;
  clearTyping: (chatId: number) => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  typingByChatId: {},

  setTyping: (chatId, userName) =>
    set((s) => ({
      typingByChatId: { ...s.typingByChatId, [chatId]: userName },
    })),

  clearTyping: (chatId) =>
    set((s) => {
      const updated = { ...s.typingByChatId };
      delete updated[chatId];
      return { typingByChatId: updated };
    }),
}));