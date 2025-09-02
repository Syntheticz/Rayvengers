"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
interface Student {
  name: string;
  section: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  students: Student[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  students: [],
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    setSocket(s);

    console.log("[socket] connecting to server...");

    s.on("connect", () => {
      console.log("[socket] connected:", s.id);

      s.emit("joinLobby", { socketId: s.id }, (ackPayload: any) => {
        console.log("[socket] joinLobby ack:", ackPayload);
      });
    });

    s.on("lobbyUpdate", (data: Student[]) => {
      console.log("[socket] lobbyUpdate:", data);
      setStudents(data);
    });

    s.on("connect_error", (err) => {
      console.error("[socket] connect_error:", err.message);
    });

    s.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, students }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for convenience
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
