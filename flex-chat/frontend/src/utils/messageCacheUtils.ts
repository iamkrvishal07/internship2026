import type { InfiniteData } from "@tanstack/react-query";

import { chatKeys } from "../hooks/tanstackQuery/useChatApi";
import { queryClient } from "./queryClient";

import type { Message } from "../types/message";

interface MessagePage {
  messages: Message[];
  [key: string]: unknown;
}

type MessageCacheData = InfiniteData<MessagePage> | Message[] | { messages: Message[] };
export const updateMessagesInCache = (
  chatId: number,
  updater: (m: Message) => Message,
) => {
  queryClient.setQueriesData<MessageCacheData>(
    { queryKey: chatKeys.messages(chatId) },
    (oldData) => {
      if (!oldData) return oldData;

      if ("pages" in oldData) {
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: (page.messages ?? []).map(updater),
          })),
        };
      }

      if (Array.isArray(oldData)) return oldData.map(updater);

      if ("messages" in oldData) {
        return { ...oldData, messages: oldData.messages.map(updater) };
      }

      return oldData;
    },
  );
};

export const appendMessageToCache = (chatId: number, message: Message) => {
  queryClient.setQueriesData<MessageCacheData>(
    { queryKey: chatKeys.messages(chatId) },
    (oldData) => {
      if (!oldData) return oldData;

      const isDuplicate = (arr: Message[]) => arr.some((m) => m.id === message.id);

      if ("pages" in oldData) {
        const pages = oldData.pages;
        const lastPage = pages[pages.length - 1];
        if (isDuplicate(lastPage.messages ?? [])) return oldData;

        return {
          ...oldData,
          pages: pages.map((page, idx: number) =>
            idx === pages.length - 1
              ? { ...page, messages: [...(page.messages ?? []), message] }
              : page,
          ),
        };
      }

      if (Array.isArray(oldData)) {
        if (isDuplicate(oldData)) return oldData;
        return [...oldData, message];
      }

      if ("messages" in oldData) {
        if (isDuplicate(oldData.messages)) return oldData;
        return { ...oldData, messages: [...oldData.messages, message] };
      }

      return oldData;
    },
  );
};

export const replaceTempMessage = (chatId: number, message: Message) => {
  queryClient.setQueriesData<MessageCacheData>(
    { queryKey: chatKeys.messages(chatId) },
    (old) => {
      if (!old) return old;

      const replaceTemp = (msgs: Message[]) => {
        const tempIndex = msgs.findIndex(
          (m) =>
            m.id < 0 &&
            m.content === message.content &&
            m.senderId === message.senderId,
        );
        if (tempIndex === -1) return msgs;
        const updated = [...msgs];
        updated[tempIndex] = { ...message, status: "sent" };
        return updated;
      };

      if ("pages" in old) {
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: replaceTemp(page.messages ?? []),
          })),
        };
      }

      if (Array.isArray(old)) return replaceTemp(old);
      if ("messages" in old) return { ...old, messages: replaceTemp(old.messages) };
      return old;
    },
  );
};

export const updateMessagesCacheTyped = (
  chatId: number,
  updater: (messages: Message[]) => Message[],
) => {
  queryClient.setQueriesData<MessageCacheData>(
    { queryKey: chatKeys.messages(chatId) },
    (old) => {
      if (!old) return old;

      if ("pages" in old) {
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: updater(page.messages ?? []),
          })),
        };
      }

      if (Array.isArray(old)) return updater(old);

      if ("messages" in old) return { ...old, messages: updater(old.messages) };

      return old;
    },
  );
};
