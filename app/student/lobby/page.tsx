"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useSocket } from "@/lib/providers/socket-provider";
import { LobbyStudent } from "@/server";

export default function StudentLobby() {
  const router = useRouter();
  const { socket, students, joinLobby } = useSocket();

  useEffect(() => {
    if (!socket) return;

    console.log("[lobby] attempting socket connect with socket:", socket);

    // ✅ This is the correct event name
    socket.on("connect", () => {
      console.log("[lobby] ✅ connected to server");

      joinLobby();
    });

    // Game started event
    socket.on("gameStarted", (gameData: any) => {
      console.log("[lobby] 🎮 GAME STARTED EVENT RECEIVED!", gameData);
      const redirectPath = `/game/${gameData.chapter || "chapter1"}`;
      console.log("[lobby] Redirecting to:", redirectPath);

      setTimeout(() => {
        console.log("[lobby] Executing router.push to:", redirectPath);
        router.push(redirectPath);
      }, 100);
    });

    // Handle disconnect
    socket.on("disconnect", (reason: any) => {
      console.log("[lobby] ❌ Disconnected:", reason);
    });

    socket.on("connect_error", (error: any) => {
      console.error("[lobby] ⚠️ Connection error:", error);
    });

    return () => {
      console.log("[lobby] Cleaning up socket listeners");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("gameStarted");
    };
  }, [socket]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      <h1
        style={{
          fontFamily: "Bangers, cursive",
          color: "#b80f2c",
          fontSize: "2.2rem",
          fontWeight: "bold",
          marginBottom: "18px",
          letterSpacing: "2px",
          textAlign: "center",
        }}
      >
        Game Lobby
      </h1>
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          padding: "24px 32px",
          minWidth: "260px",
          maxWidth: "340px",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Press Start 2P', cursive",
            color: "#b80f2c",
            fontSize: "1.1rem",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          Students in Lobby
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {students
            .filter((s) => (s.role ? s.role === "student" : true))
            .slice()
            .sort((a, b) => (a.group || 0) - (b.group || 0))
            .map((s, i) => (
              <li
                key={i}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#333",
                  fontSize: "1rem",
                  marginBottom: "8px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                {s.name} <span style={{ color: "#b80f2c" }}>[{s.section}]</span>
                {s.group && (
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: 8,
                      background: `hsl(${(s.group * 57) % 360} 70% 45%)`,
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "0.65rem",
                    }}
                  >
                    G{s.group}
                  </span>
                )}
              </li>
            ))}
        </ul>
      </div>
      <button
        onClick={() => router.push("/student/guide")}
        style={{
          background: "#b80f2c",
          color: "#ffcc66",
          border: "none",
          borderRadius: 8,
          padding: "12px 28px",
          fontWeight: 700,
          fontFamily: "Bangers, cursive",
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        Back
      </button>
    </div>
  );
}
