import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

export const useWebSocket = (debateId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [incomingScore, setIncomingScore] = useState(null);

  useEffect(() => {
    if (!debateId) return;

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket server");
      socketRef.current.emit("join-debate", debateId);
    });

    socketRef.current.on("ai-thinking", () => {
      setIsAiThinking(true);
    });

    socketRef.current.on("ai-message", (message) => {
      setIsAiThinking(false);
      setIncomingMessage(message);
    });

    socketRef.current.on("score-update", (scoreData) => {
      setIncomingScore(scoreData);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [debateId]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("user-message", { ...data, debateId });
    }
  }, [isConnected, debateId]);

  return {
    isConnected,
    isAiThinking,
    incomingMessage,
    incomingScore,
    sendMessage,
    setIncomingMessage,
    setIncomingScore
  };
};
