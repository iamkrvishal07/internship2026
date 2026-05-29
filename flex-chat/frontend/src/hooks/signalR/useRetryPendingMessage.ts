import { useEffect, useRef } from "react";

import * as signalR from "@microsoft/signalr";

import { PENDING_RETRY_INTERVAL } from "../../constants/defaults";
import { sendMessageViaSignalR } from "../../services/signalRService";
import { usePendingMessagesStore } from "../../stores/pendingMessageStore";
import { queryClient } from "../../utils/queryClient";
import { chatKeys } from "../tanstackQuery/useChatApi";
import { useConnection } from "./useConnection";

export const useRetryPendingMessages = () => {
  const connection = useConnection();
  const isRetrying = useRef(false);

  useEffect(() => {
    if (!connection) return;

    const trySendPending = async () => {
      if (isRetrying.current) return;
      if (connection.state !== signalR.HubConnectionState.Connected) return;

      const { pending, removePending } =
        usePendingMessagesStore.getState();

      if (pending.length === 0) return;

      isRetrying.current = true;
      console.log(`[PendingMessages] Retrying ${pending.length} messages`);

      for (const msg of pending) {
        try {
          await sendMessageViaSignalR(msg.chatId, msg.content, msg.contentType);

          removePending(msg.tempId);

          queryClient.setQueriesData<any>(
            { queryKey: chatKeys.messages(msg.chatId) },
            (old: any) => {
              if (!old) return old;
              const filter = (arr: any[]) =>
                arr.filter((m) => m.id !== msg.tempId);
              if (Array.isArray(old)) return filter(old);
              if (old.messages)
                return { ...old, messages: filter(old.messages) };
              return old;
            },
          );

          console.log(`[PendingMessages] Sent message ${msg.tempId} ✅`);
        } catch (err) {
          console.error(
            `[PendingMessages] Failed to retry message ${msg.tempId}`,
            err,
          );
        }
      }

      isRetrying.current = false;
    };

    const handleReconnected = () => {
      console.log("[PendingMessages] Reconnected — retrying pending messages");
      trySendPending();
    };

    if (connection.state === signalR.HubConnectionState.Connected) {
      trySendPending();
    }

    connection.onreconnected(handleReconnected);

    const interval = setInterval(() => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        trySendPending();
      }
    }, PENDING_RETRY_INTERVAL);

    return () => clearInterval(interval);
  }, [connection]);
};