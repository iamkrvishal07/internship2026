import * as signalR from "@microsoft/signalr";

import {
  SIGNALR_LONG_RETRY_MS,
  SIGNALR_RETRY_THRESHOLD_MS,
  SIGNALR_SHORT_RETRY_MS,
} from "../constants/defaults";
import type { Message } from "../types/message";
import apiRoutes from "../constants/routes/apiRoutes";
import { SIGNALR_SERVER_EVENTS } from "../constants/signalR/signalREvents";

let connectionListeners: Array<(conn: signalR.HubConnection | null) => void> =
  [];

export const subscribeToConnection = (
  cb: (conn: signalR.HubConnection | null) => void,
) => {
  connectionListeners.push(cb);
  return () => {
    connectionListeners = connectionListeners.filter((l) => l !== cb);
  };
};

const notifyListeners = (conn: signalR.HubConnection | null) => {
  connectionListeners.forEach((cb) => cb(conn));
};
let connection: signalR.HubConnection | null = null;

export const createConnection = (token: string) => {
  if (connection) {
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(apiRoutes.signalR, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        if (retryContext.elapsedMilliseconds < SIGNALR_RETRY_THRESHOLD_MS) {
          return SIGNALR_SHORT_RETRY_MS;
        } else {
          return SIGNALR_LONG_RETRY_MS;
        }
      },
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();
  notifyListeners(connection);

  connection.onreconnecting((error) => {
    console.log("SignalR reconnecting...", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("SignalR reconnected:", connectionId);
  });

  connection.onclose((error) => {
    console.log("SignalR connection closed:", error);
    connection = null;
    notifyListeners(null);
  });

  return connection;
};

export const getConnection = () => connection;

export const startConnection = async (): Promise<void> => {
  if (!connection) {
    throw new Error("Connection not initialized. Call createConnection first.");
  }

  if (connection.state === signalR.HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log("SignalR Connected");
    } catch (error) {
      console.error("SignalR Connection Error:", error);
      throw error;
    }
  }
};

export const stopConnection = async (): Promise<void> => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    try {
      await connection.stop();
      console.log("SignalR Disconnected");
    } catch (error) {
      console.error("Error stopping SignalR:", error);
    }
  }
};

export const joinChat = async (chatId: number): Promise<void> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    throw new Error("SignalR not connected");
  }

  try {
    await connection.invoke(SIGNALR_SERVER_EVENTS.JOIN_CHAT, chatId);
    console.log(`Joined chat room: ${chatId}`);
  } catch (error) {
    console.error(`Failed to join chat ${chatId}:`, error);
    throw error;
  }
};

export const leaveChat = async (chatId: number): Promise<void> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    return;
  }

  try {
    await connection.invoke(SIGNALR_SERVER_EVENTS.LEAVE_CHAT, chatId);
    console.log(`Left chat room: ${chatId}`);
  } catch (error) {
    console.error(`Failed to leave chat ${chatId}:`, error);
  }
};

export const sendMessageViaSignalR = async (
  chatId: number,
  content: string,
  contentType: string = "text",
  parentId?: number,
): Promise<Message> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    throw new Error("SignalR not connected");
  }

  try {
    const message = await connection.invoke(
      SIGNALR_SERVER_EVENTS.SEND_MESSAGE,
      chatId,
      {
        content,
        contentType,
        parentId,
      },
    );

    console.log("Message sent via SignalR:", message);
    return message;
  } catch (error) {
    console.error("Failed to send message via SignalR:", error);
    throw error;
  }
};

export const editMessageViaSignalR = async (
  messageId: number,
  newContent: string,
): Promise<Message> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    throw new Error("SignalR not connected");
  }

  try {
    const message = await connection.invoke(
      SIGNALR_SERVER_EVENTS.EDIT_MESSAGE,
      messageId,
      newContent,
    );
    console.log("Message edited via SignalR:", message);
    return message;
  } catch (error) {
    console.error("Failed to edit message via SignalR:", error);
    throw error;
  }
};

export const deleteMessageViaSignalR = async (
  messageId: number,
): Promise<void> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    throw new Error("SignalR not connected");
  }

  try {
    await connection.invoke(SIGNALR_SERVER_EVENTS.DELETE_MESSAGE, messageId);
    console.log("Message deleted via SignalR");
  } catch (error) {
    console.error("Failed to delete message via SignalR:", error);
    throw error;
  }
};

export const sendTypingIndicator = async (
  chatId: number,
  fullName: string | null,
  isTyping: boolean,
): Promise<void> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    return;
  }

  try {
    await connection.invoke(
      SIGNALR_SERVER_EVENTS.SEND_TYPING,
      chatId,
      fullName,
      isTyping,
    );
  } catch (error) {
    console.error("Failed to send typing indicator:", error);
  }
};

export const acknowledgeDelivery = async (messageId: number): Promise<void> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    return;
  }

  try {
    await connection.invoke(
      SIGNALR_SERVER_EVENTS.ACKNOWLEDGE_DELIVERY,
      messageId,
    );
  } catch (error) {
    console.error("Failed to acknowledge delivery:", error);
  }
};

export const markMessagesRead = async (
  chatId: number,
  lastReadMessageId: number,
): Promise<void> => {
  if (
    !connection ||
    connection.state !== signalR.HubConnectionState.Connected
  ) {
    return;
  }
  try {
    await connection.invoke(SIGNALR_SERVER_EVENTS.MARK_READ, chatId, {
      lastReadMessageId,
    });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
  }
};

export const toggleReaction = async (
  messageId: number,
  emojiCode: string,
): Promise<void> => {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected)
    return;
  await connection.invoke(
    SIGNALR_SERVER_EVENTS.TOGGLE_REACTION,
    messageId,
    emojiCode,
  );
};

export const notifyNewChat = async (chatId: number, userId: number) => {
  const conn = getConnection();

  if (!conn || conn.state !== "Connected") {
    return;
  }

  await conn.invoke(SIGNALR_SERVER_EVENTS.NOTIFY_NEW_CHAT, chatId, userId);
};
