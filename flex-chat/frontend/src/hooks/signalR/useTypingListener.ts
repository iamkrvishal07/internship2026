import { useEffect } from "react";

import { SIGNALR_CLIENT_EVENTS } from "../../constants/signalR/signalREvents";
import { useTypingStore } from "../../stores/typingStore";
import { queryClient } from "../../utils/queryClient";
import { chatKeys } from "../tanstackQuery/useChatApi";
import { useCurrentUserId } from "../useCurrentUserId";
import { useConnection } from "./useConnection";

export const useTypingListener = () => {
  const connection = useConnection();
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    if (!connection) return;

    const handleUserTyping = (payload: {
      chatId: number;
      userId: number;
      fullName: string;
      isTyping: boolean;
    }) => {
      if (payload.userId === currentUserId) return;

      if (!payload.isTyping) {
        useTypingStore.getState().clearTyping(payload.chatId);
        return;
      }

      const chats = queryClient.getQueryData<any[]>(chatKeys.list());
      const chat = chats?.find((c) => c.id === payload.chatId);
      const member = chat?.members?.find(
        (m: any) => m.userId === payload.userId,
      );

      const name = member?.fullName || payload.fullName || "Someone";

      useTypingStore.getState().setTyping(payload.chatId, name);
    };

    connection.on(SIGNALR_CLIENT_EVENTS.USER_TYPING, handleUserTyping);
    return () => connection.off(SIGNALR_CLIENT_EVENTS.USER_TYPING, handleUserTyping);
  }, [connection, currentUserId]);
};
