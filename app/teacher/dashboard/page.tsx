"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface LeaderboardRow {
  rank: number;
  team: string;
  score: number;
}

interface LobbyStudent {
  id: string;
  name: string;
  section: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [chapters, setChapters] = useState({
    c1: true,
    c2: false,
    c3: false,
  });
  const [groups, setGroups] = useState(4);
  const [lobbyStudents, setLobbyStudents] = useState<LobbyStudent[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [leaderboard] = useState<LeaderboardRow[]>([
    { rank: 1, team: "Team A", score: 980 },
    { rank: 2, team: "Team B", score: 870 },
    { rank: 3, team: "Team C", score: 760 },
  ]);

  // Load saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("teacher_dashboard_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setChapters(parsed.chapters ?? chapters);
        setGroups(parsed.groups ?? groups);
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket connection for lobby monitoring
  useEffect(() => {
    const s = io("http://localhost:3000");
    setSocket(s);

    console.log("[teacher] connecting to lobby socket");

    s.on("connect", () => {
      console.log("[teacher] connected to lobby", s.id);
      // Don't emit joinLobby for teachers - they're observers only
    });

    s.on("lobbyUpdate", (students: LobbyStudent[]) => {
      console.log("[teacher] received lobbyUpdate", students);
      setLobbyStudents(students);
    });

    s.on("gameStarted", (gameData: any) => {
      console.log("[teacher] game started confirmation:", gameData);
      // Teacher can receive confirmation but doesn't redirect
    });

    s.on("gameStartAck", (ackData: any) => {
      console.log("[teacher] received game start acknowledgment:", ackData);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const toggleChapter = (key: keyof typeof chapters) => {
    setChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveChanges = () => {
    const payload = { chapters, groups };
    localStorage.setItem("teacher_dashboard_settings", JSON.stringify(payload));
    alert("Settings saved (local). In a real app this would persist to the server.");
  };

  const startGame = () => {
    console.log("[teacher] startGame clicked");
    console.log("[teacher] socket:", socket);
    console.log("[teacher] lobbyStudents.length:", lobbyStudents.length);
    
    if (socket && lobbyStudents.length > 0) {
      console.log("[teacher] Starting game for", lobbyStudents.length, "students");
      socket.emit("startGame", {
        chapter: "chapter1",
        level: "level1",
        groups: groups,
        enabledChapters: chapters
      });
      console.log("[teacher] startGame event emitted");
      alert(`Game started! ${lobbyStudents.length} students will be redirected to Chapter 1.`);
    } else {
      console.log("[teacher] Cannot start game - socket:", !!socket, "students:", lobbyStudents.length);
      alert("No students in lobby to start the game.");
    }
  };

  const exportCSV = () => {
    const header = ["Rank", "Team", "Score"];
    const rows = leaderboard.map((r) => [r.rank, r.team, r.score]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leaderboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 32, minHeight: "100vh", background: "#0b0b0b", color: "#fff", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 350px 350px", gap: 28, alignItems: "start" }}>
        <section style={{ background: "#111", padding: 28, borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.6)", border: "1px solid rgba(255,204,102,0.06)" }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#ffcc66" }}>Class Controls</h2>
          <p style={{ marginTop: 8, color: "#ddd" }}>Lock or unlock chapters and configure the game.</p>

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={chapters.c1} onChange={() => toggleChapter("c1")} />
              <div>
                <div style={{ color: "#ffcc66", fontWeight: 700 }}>Chapter 1: The Mirror of Truth</div>
                <div style={{ color: "#ccc", fontSize: 13 }}>Path: <code style={{ background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 6, color: "#fff" }}>/student/guide/page.tsx</code></div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={chapters.c2} onChange={() => toggleChapter("c2")} />
              <div>
                <div style={{ color: "#ffcc66", fontWeight: 700 }}>Chapter 2: The Equation of Clarity</div>
                <div style={{ color: "#ccc", fontSize: 13 }}>Path: <em style={{ color: "#bbb" }}>/chapter-2</em></div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={chapters.c3} onChange={() => toggleChapter("c3")} />
              <div>
                <div style={{ color: "#ffcc66", fontWeight: 700 }}>Chapter 3: The Lens of Vision</div>
                <div style={{ color: "#ccc", fontSize: 13 }}>Path: <em style={{ color: "#bbb" }}>/chapter-3</em></div>
              </div>
            </label>
          </div>

          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ color: "#ddd", fontWeight: 700 }}>Number of groups</label>
            <input type="number" min={1} max={20} value={groups} onChange={(e) => setGroups(Number(e.target.value))} style={{ width: 80, padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "#0b0b0b", color: "#fff" }} />
          </div>

          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <button onClick={saveChanges} style={{ background: "#ffcc66", border: "none", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Save changes</button>
            <button onClick={startGame} style={{ background: "#b80f2c", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Start game</button>
            <button onClick={() => {signOut({ redirectTo: "/" })}} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 8, color: '#fff' }}>Logout</button>
          </div>
        </section>

        <aside style={{ background: "#0f0f0f", padding: 22, borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.6)", border: "1px solid rgba(64,224,208,0.06)" }}>
          <h3 style={{ margin: 0, color: "#40e0d0" }}>Live Lobby ({lobbyStudents.length})</h3>
          <p style={{ color: "#ddd", fontSize: 13, marginTop: 6 }}>Students currently in the lobby.</p>

          {lobbyStudents.length === 0 ? (
            <div style={{ marginTop: 16, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 8, textAlign: "center", color: "#888" }}>
              No students in lobby
            </div>
          ) : (
            <div style={{ marginTop: 16, maxHeight: 300, overflowY: "auto" }}>
              {lobbyStudents.map((student) => (
                <div key={student.id} style={{ 
                  padding: "8px 12px", 
                  marginBottom: 8, 
                  background: "rgba(64,224,208,0.08)", 
                  borderRadius: 8, 
                  border: "1px solid rgba(64,224,208,0.15)" 
                }}>
                  <div style={{ color: "#40e0d0", fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                  <div style={{ color: "#aaa", fontSize: 12 }}>Section {student.section} • ID: {student.id.slice(-4)}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(64,224,208,0.04)", borderRadius: 6, fontSize: 12, color: "#40e0d0" }}>
            🔄 Updates in real-time
          </div>
        </aside>

        <aside style={{ background: "#0f0f0f", padding: 22, borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.6)", border: "1px solid rgba(255,204,102,0.04)" }}>
          <h3 style={{ margin: 0, color: "#ffcc66" }}>Leaderboard (static)</h3>
          <p style={{ color: "#ddd", fontSize: 13, marginTop: 6 }}>Download as CSV for analysis.</p>

          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <th style={{ padding: "8px 6px", color: '#fff' }}>#</th>
                <th style={{ padding: "8px 6px", color: '#fff' }}>Team</th>
                <th style={{ padding: "8px 6px", color: '#fff' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r) => (
                <tr key={r.rank} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "10px 6px", color: '#ffcc66', fontWeight: 700 }}>{r.rank}</td>
                  <td style={{ padding: "10px 6px" }}>{r.team}</td>
                  <td style={{ padding: "10px 6px" }}>{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={exportCSV} style={{ background: "#ffcc66", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Export CSV</button>
            <button onClick={() => alert('Static preview: CSV export and leaderboard are demo-only.')} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", padding: "8px 12px", borderRadius: 8, color: "#fff" }}>Refresh</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
