"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Student {
  id: string;
  name: string;
  section: string;
  group?: number;
  role?: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  students: Student[];
  user: Student | null;
  joinLobby: () => void;
  getLobby: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  students: [],
  user: null,
  joinLobby: () => {},
  getLobby: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<Student | null>(null);

  useEffect(() => {
    const s = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("[socket] connected:", s.id);
      setConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("[socket] connect_error:", err.message);
    });

    // server emits this right after connect
    s.on("userInfo", (u: Student) => {
      console.log("[socket] userInfo received:", u);
      setUser(u);
    });

    // server emits this once when connected
    s.on("lobbyUpdate", (data: Student[]) => {
      console.log("[socket] lobbyUpdate:", data);
      setStudents(data);
    });

    // server emits this whenever students join/leave
    s.on("waitingLobbyUpdate", (data: Student[]) => {
      console.log("[socket] waitingLobbyUpdate:", data);
      setStudents(data);
    });

    // return () => {
    //   console.log("[SocketProvider] cleanup socket", s.id);
    //   s.disconnect();
    // };
  }, []);

  // helper to join lobby
  const joinLobby = () => {
    if (!socket) return;
    socket.emit("joinLobby", {}, (ack: Student) => {
      console.log("[socket] joinLobby ack:", ack);
    });
  };

  // helper to request lobby (uses ack)
  const getLobby = () => {
    if (!socket) return;
    socket.emit("getLobby", (lobby: Student[]) => {
      console.log("[socket] getLobby ack:", lobby);
      setStudents(lobby);
    });
  };

  return (
    <SocketContext.Provider
      value={{ socket, connected, students, user, joinLobby, getLobby }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  return useContext(SocketContext);
}
