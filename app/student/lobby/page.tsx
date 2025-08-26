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

    s.on("lobbyUpdate", (data: Student[]) => setStudents(data));

    s.emit("joinLobby", {
      name: localStorage.getItem("name") || "You",
      section: localStorage.getItem("section") || "?"
    });

    return () => {
      s.disconnect();
    };
  }, []);

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
