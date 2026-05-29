import { useEffect } from "react";

import { SIGNALR_SERVER_EVENTS } from "../../constants/signalR/signalREvents";
import { getConnection } from "../../services/signalRService";

export const useChatRoom = (chatId?: number | null) => {
  useEffect(() => {
    if (!chatId) return;

    const conn = getConnection();
    if (!conn) return;

    const join = async () => {
      let retries = 0;
      while (conn.state !== "Connected" && retries < 10) {
        await new Promise((r) => setTimeout(r, 200));
        retries++;
      }
      if (conn.state !== "Connected") {
        console.warn("[useChatRoom] Connection not ready after retries");
        return;
      }
      conn.invoke(SIGNALR_SERVER_EVENTS.JOIN_CHAT, chatId)
        .then(() => console.log("[useChatRoom] Joined chat:", chatId))
        .catch(console.error);
    };

    join();

    return () => {
      const c = getConnection();
      if (!c || c.state !== "Connected") return;
      c.invoke(SIGNALR_SERVER_EVENTS.LEAVE_CHAT, chatId)
        .then(() => console.log("[useChatRoom] Left chat:", chatId))
        .catch(console.error);
    };
  }, [chatId]);
};