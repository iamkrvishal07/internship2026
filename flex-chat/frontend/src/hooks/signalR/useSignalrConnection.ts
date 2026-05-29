import { useEffect } from "react";

import { SIGNALR_SERVER_EVENTS } from "../../constants/signalR/signalREvents";
import { createConnection, getConnection } from "../../services/signalRService";
import { usePresenceStore } from "../../stores/presenceStore";

export const useSignalrConnection = (token: string | null, chatId?: number) => {
  useEffect(() => {
    if (!token) return;

    const connection = createConnection(token);

    const startConnection = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
          console.log("SignalR Connected");

          const onlineIds = await connection.invoke<number[]>(SIGNALR_SERVER_EVENTS.GET_ONLINE_USERS);
          onlineIds.forEach((id) => usePresenceStore.getState().setOnline(id));
          console.log(`[Presence] ${onlineIds.length} users online`);
        }

        if (chatId) {
          await connection.invoke(SIGNALR_SERVER_EVENTS.JOIN_CHAT, chatId);
          console.log("Joined Chat:", chatId);
        }
      } catch (error) {
        console.error("SignalR Connection Error:", error);
      }
    };

    startConnection();

    return () => {
      const conn = getConnection();

      if (conn && conn.state === "Connected" && chatId) {
        conn.invoke(SIGNALR_SERVER_EVENTS.LEAVE_CHAT, chatId);
      }
    };
  }, [token, chatId]);
};
