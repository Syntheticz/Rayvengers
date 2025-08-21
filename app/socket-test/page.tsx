"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
}

export default function Game() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [me, setMe] = useState<Player | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.on("connect", () => {
      console.log("✅ Connected:", newSocket.id);
    });

    newSocket.on("players", (serverPlayers: Record<string, Player>) => {
      setPlayers(serverPlayers);

      if (newSocket.id && serverPlayers[newSocket.id]) {
        setMe(serverPlayers[newSocket.id]);
      }
    });

    newSocket.on("player-joined", (player: Player) => {
      setPlayers((prev) => ({ ...prev, [player.id]: player }));
    });

    newSocket.on("player-moved", (player: Player) => {
      setPlayers((prev) => ({ ...prev, [player.id]: player }));
    });

    newSocket.on("player-left", (id: string) => {
      setPlayers((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Movement controls
  useEffect(() => {
    if (!socket || !me) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let { x, y } = me;
      const step = 10;

      if (e.key === "ArrowUp") y -= step;
      if (e.key === "ArrowDown") y += step;
      if (e.key === "ArrowLeft") x -= step;
      if (e.key === "ArrowRight") x += step;

      const newPos = { ...me, x, y };
      setMe(newPos);
      setPlayers((prev) => ({ ...prev, [me.id]: newPos }));
      socket.emit("move", { x, y });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [socket, me]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="relative w-[500px] h-[500px] bg-gray-800 border-2 border-white">
        {Object.values(players).map((p) => (
          <div
            key={p.id}
            className="absolute w-8 h-8 rounded-md"
            style={{
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
