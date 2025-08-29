"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Student {
  name: string;
  section: string;
}

export default function StudentLobby() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:3000");
    setSocket(s);

    console.log("[lobby] attempting socket connect to http://localhost:3000");

    s.on("connect", () => {
      console.log("[lobby] connected", s.id);
      s.emit("joinLobby", {
        socketId: s.id
      }, (ackPayload: any) => {
        console.log("[lobby] joinLobby ack:", ackPayload);
      });
    });

    s.on("lobbyUpdate", (data: Student[]) => {
      console.log("[lobby] received lobbyUpdate", data);
      setStudents(data);
    });

    s.on("testEvent", (data: any) => {
      console.log("[lobby] 📡 TEST EVENT RECEIVED:", data);
    });

    s.on("gameStarted", (gameData: any) => {
      console.log("[lobby] 🎮 GAME STARTED EVENT RECEIVED!", gameData);
      const redirectPath = `/game/${gameData.chapter || "chapter1"}`;
      console.log("[lobby] Redirecting to:", redirectPath);
      
      // Add a small delay to ensure the log is visible
      setTimeout(() => {
        console.log("[lobby] Executing router.push to:", redirectPath);
        router.push(redirectPath);
      }, 100);
    });

    s.on("joined", (payload: any) => {
      console.log("[lobby] joined ack:", payload);
    });

    // Add error handling
    s.on("connect_error", (error: any) => {
      console.error("[lobby] Connection error:", error);
    });

    s.on("disconnect", (reason: any) => {
      console.log("[lobby] Disconnected:", reason);
    });

    return () => {
      console.log("[lobby] Cleaning up socket connection");
      s.disconnect();
    };
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
      <h1 style={{ fontFamily: "Bangers, cursive", color: "#b80f2c", fontSize: "2.2rem", fontWeight: "bold", marginBottom: "18px", letterSpacing: "2px", textAlign: "center" }}>
        Game Lobby
      </h1>
      <div style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", padding: "24px 32px", minWidth: "260px", maxWidth: "340px", width: "100%", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "'Press Start 2P', cursive", color: "#b80f2c", fontSize: "1.1rem", marginBottom: "12px", textAlign: "center" }}>Students in Lobby</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {students.map((s, i) => (
            <li key={i} style={{ fontFamily: "'Press Start 2P', cursive", color: "#333", fontSize: "1rem", marginBottom: "8px", textAlign: "center" }}>
              {s.name} <span style={{ color: "#b80f2c" }}>[{s.section}]</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => router.push("/student/guide")}
        style={{ background: "#b80f2c", color: "#ffcc66", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, fontFamily: "Bangers, cursive", fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        Back
      </button>
    </div>
  );
}
