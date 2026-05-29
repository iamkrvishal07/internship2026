import { useEffect } from "react";

import { showNewMessageToast } from "../../components/common/ChatToast";
import routes from "../../constants/routes/routes";
import { SIGNALR_CLIENT_EVENTS } from "../../constants/signalR/signalREvents";
import { acknowledgeDelivery } from "../../services/signalRService";
import { useAuthStore } from "../../stores/authStore";
import { usePresenceStore } from "../../stores/presenceStore";
import { useStreamingStore } from "../../stores/streamingStore";
import { getUserIdFromToken } from "../../utils/jwtUtils";
import {
  appendMessageToCache,
  replaceTempMessage,
  updateMessagesInCache,
} from "../../utils/messageCacheUtils";
import { queryClient } from "../../utils/queryClient";
import { chatKeys } from "../tanstackQuery/useChatApi";
import { useUpdateUrl } from "../useUpdateUrl";
import { useConnection } from "./useConnection";
import { ChatType } from "../../constants/app/appConstants";

import type { Conversation } from "../../types/chat";

export const useSignalRGlobalListeners = (activeChatId?: number) => {
  const token = useAuthStore((state) => state.accessToken);
  const CURRENT_USER_ID = getUserIdFromToken(token);
  const connection = useConnection();
  const updateUrl = useUpdateUrl();

  useEffect(() => {
    if (!connection) return;

    const handleMessageReceived = (message: any) => {
      console.log("[SignalR] MessageReceived:", message);

      queryClient.setQueryData<Conversation[]>(
        chatKeys.list(),
        (oldChats = []) => {
          const exists = oldChats.find((c) => c.id === message.chatId);

          if (exists) {
            const updated = oldChats.map((chat) => {
              if (chat.id !== message.chatId) return chat;
              return {
                ...chat,
                unreadCount:
                  message.senderId === CURRENT_USER_ID
                    ? chat.unreadCount
                    : chat.unreadCount + 1,
                lastMessage: {
                  id: message.id,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  contentType: message.contentType ?? "text",
                  content: message.content,
                  createdAt: message.createdAt,
                  isDeleted: false,
                },
              };
            });

            const active = updated.find((c) => c.id === message.chatId)!;
            const rest = updated.filter((c) => c.id !== message.chatId);
            return [active, ...rest];
          }

          return [
            {
              id: message.chatId,
              type: ChatType.direct,
              name: message.senderName,
              imageUrl: message.senderAvatarUrl || "",
              description: "",
              createdBy: message.senderId,
              createdAt: message.createdAt,
              unreadCount: message.senderId === CURRENT_USER_ID ? 0 : 1,
              members: [],
              lastMessage: {
                id: message.id,
                senderId: message.senderId,
                senderName: message.senderName,
                contentType: message.contentType ?? "text",
                content: message.content,
                createdAt: message.createdAt,
                isDeleted: false,
              },
            } as Conversation,
            ...oldChats,
          ];
        },
      );

      queryClient.setQueryData(
        chatKeys.detail(message.chatId),
        (oldChat: any) => {
          if (!oldChat) return oldChat;
          return {
            ...oldChat,
            lastMessage: {
              id: message.id,
              senderId: message.senderId,
              senderName: message.senderName,
              contentType: message.contentType ?? "text",
              content: message.content,
              createdAt: message.createdAt,
              isDeleted: false,
            },
          };
        },
      );

      appendMessageToCache(message.chatId, message);

      if (message.senderId !== CURRENT_USER_ID) {
        useStreamingStore.getState().addStreaming(message.id);

        if (!message.receipt?.deliveredUserIds?.includes(CURRENT_USER_ID)) {
          acknowledgeDelivery(message.id);
        }

        if (message.chatId !== activeChatId) {
          const chats = queryClient.getQueryData<any[]>(chatKeys.list());
          const chat = chats?.find((c) => c.id === message.chatId);
          const other = chat?.members?.find(
            (mem: any) => mem.userId !== CURRENT_USER_ID,
          );

          showNewMessageToast({
            message,
            avatarUrl: other?.avatarUrl ?? "",
            onClick: () => {
              updateUrl(routes.chats, { chatId: message.chatId }, true);
            },
          });
        }
      }
    };

    const handleMessageSaved = (message: any) => {
      console.log("[SignalR] MessageSaved:", message);
      replaceTempMessage(message.chatId, message);
    };

    const handleReceiptUpdated = (receipt: any) => {
      if (!receipt.chatId) return;

      updateMessagesInCache(receipt.chatId, (m) => {
        if (m.id !== receipt.messageId) return m;

        const deliveredUserIds = m.receipt?.deliveredUserIds ?? [];
        const readUserIds = m.receipt?.readUserIds ?? [];

        return {
          ...m,
          receipt: {
            ...m.receipt,
            deliveredUserIds: receipt.deliveredAt
              ? deliveredUserIds.includes(receipt.userId)
                ? deliveredUserIds
                : [...deliveredUserIds, receipt.userId]
              : deliveredUserIds,
            readUserIds: receipt.readAt
              ? readUserIds.includes(receipt.userId)
                ? readUserIds
                : [...readUserIds, receipt.userId]
              : readUserIds,
            deliveredAt: receipt.deliveredAt ?? m.receipt?.deliveredAt,
            readAt: receipt.readAt ?? m.receipt?.readAt,
          },
        };
      });
    };

    const handleMessageDeleted = (payload: any) => {
      updateMessagesInCache(payload.chatId, (m) =>
        m.id !== payload.messageId
          ? m
          : { ...m, isDeleted: true, content: "This message was deleted" },
      );
    };

    const handleMessageEdited = (payload: any) => {
      updateMessagesInCache(payload.chatId, (m) =>
        m.id !== payload.messageId
          ? m
          : {
              ...m,
              content: payload.newContent,
              isEdited: true,
              editedAt: payload.editedAt,
            },
      );
    };

    const handleReactionAdded = (payload: {
      messageId: number;
      chatId: number;
      userId: number;
      emojiCode: string;
    }) => {
      updateMessagesInCache(payload.chatId, (m) => {
        if (m.id !== payload.messageId) return m;

        const reactions: any[] = m.reactions ?? [];
        const existing = reactions.find(
          (r: any) => r.emojiCode === payload.emojiCode,
        );

        if (existing) {
          if (existing.userIds.includes(payload.userId)) return m;
          return {
            ...m,
            reactions: reactions.map((r: any) =>
              r.emojiCode === payload.emojiCode
                ? {
                    ...r,
                    count: r.count + 1,
                    userIds: [...r.userIds, payload.userId],
                  }
                : r,
            ),
          };
        }

        return {
          ...m,
          reactions: [
            ...reactions,
            {
              emojiCode: payload.emojiCode,
              count: 1,
              userIds: [payload.userId],
            },
          ],
        };
      });
    };

    const handleReactionRemoved = (payload: {
      messageId: number;
      chatId: number;
      userId: number;
      emojiCode: string;
    }) => {
      updateMessagesInCache(payload.chatId, (m) => {
        if (m.id !== payload.messageId) return m;

        return {
          ...m,
          reactions: (m.reactions ?? [])
            .map((r: any) =>
              r.emojiCode === payload.emojiCode
                ? {
                    ...r,
                    count: r.count - 1,
                    userIds: r.userIds.filter(
                      (id: number) => id !== payload.userId,
                    ),
                  }
                : r,
            )
            .filter((r: any) => r.count > 0),
        };
      });
    };

    const handleUserPresenceChanged = (userId: number, isOnline: boolean) => {
      console.log(
        `[SignalR] UserPresenceChanged: ${userId} → ${isOnline ? "online" : "offline"}`,
      );
      if (isOnline) {
        usePresenceStore.getState().setOnline(userId);
      } else {
        usePresenceStore.getState().setOffline(userId);
      }
    };

    const handleChatCreated = (chat: Conversation) => {
  console.log("[SignalR] ChatCreated:", chat);

  queryClient.setQueryData<Conversation[]>(
    chatKeys.list(),
    (old = []) => {
      const exists = old.some((c) => c.id === chat.id);
      if (exists) return old;
      return [chat, ...old]; 
    }
  );

 
  if (connection && connection.state === "Connected") {
    connection.invoke("JoinChat", chat.id)
      .then(() => console.log("[SignalR] Auto-joined new chat group:", chat.id))
      .catch(console.error);
  }
};

    connection.on(SIGNALR_CLIENT_EVENTS.CHAT_CREATED, handleChatCreated);
    connection.on(SIGNALR_CLIENT_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
    connection.on(SIGNALR_CLIENT_EVENTS.MESSAGE_SAVED, handleMessageSaved);
    connection.on(SIGNALR_CLIENT_EVENTS.RECEIPT_UPDATED, handleReceiptUpdated);
    connection.on(SIGNALR_CLIENT_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    connection.on(SIGNALR_CLIENT_EVENTS.MESSAGE_EDITED, handleMessageEdited);
    connection.on(SIGNALR_CLIENT_EVENTS.REACTION_ADDED, handleReactionAdded);
    connection.on(SIGNALR_CLIENT_EVENTS.REACTION_REMOVED, handleReactionRemoved);
    connection.on(SIGNALR_CLIENT_EVENTS.USER_PRESENCE_CHANGED, handleUserPresenceChanged);

    console.log("[SignalR] Global listeners registered");

    return () => {
      connection.off(SIGNALR_CLIENT_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
      connection.off(SIGNALR_CLIENT_EVENTS.MESSAGE_SAVED, handleMessageSaved);
      connection.off(SIGNALR_CLIENT_EVENTS.RECEIPT_UPDATED, handleReceiptUpdated);
      connection.off(SIGNALR_CLIENT_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      connection.off(SIGNALR_CLIENT_EVENTS.MESSAGE_EDITED, handleMessageEdited);
      connection.off(SIGNALR_CLIENT_EVENTS.REACTION_ADDED, handleReactionAdded);
      connection.off(SIGNALR_CLIENT_EVENTS.REACTION_REMOVED, handleReactionRemoved);
      connection.off(SIGNALR_CLIENT_EVENTS.USER_PRESENCE_CHANGED, handleUserPresenceChanged);
      connection.off(SIGNALR_CLIENT_EVENTS.CHAT_CREATED, handleChatCreated);


      console.log("[SignalR] Global listeners cleaned up");
    };
  }, [activeChatId, CURRENT_USER_ID, connection]);
};
