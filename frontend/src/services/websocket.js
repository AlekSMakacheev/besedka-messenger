import { Client } from "@stomp/stompjs";
import { API_URL } from "./api";

export const createWebSocketClient = (token, onConnect) => {
  const wsUrl = API_URL.replace(/^http/, "ws") + "/ws";

  const client = new Client({
    brokerURL: wsUrl,
    connectHeaders: { Authorization: `Bearer ${token}` },
    onConnect: () => {
      if (onConnect) onConnect(client);
    },
  });

  return client;
};