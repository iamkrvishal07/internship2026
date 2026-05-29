import { useEffect,useState } from "react";

import { getConnection, subscribeToConnection } from "../../services/signalRService";

import type * as signalR from "@microsoft/signalr";

export const useConnection = () => {
  const [conn, setConn] = useState<signalR.HubConnection | null>(
    getConnection() 
  );

  useEffect(() => {
    const unsubscribe = subscribeToConnection((c) => setConn(c));
    return unsubscribe;
  }, []);

  return conn;
};