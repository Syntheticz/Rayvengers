"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useSocket } from "@/lib/providers/socket-provider";
import { Lobby } from "@prisma/client";
import { LobbyWithRelation } from "@/types/lobby";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  createLobby,
  updateLobby,
  deleteLobby,
  getLobbies,
  deleteAllLobbies,
} from "@/lib/actions";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
function randomCode(length = 4) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

interface LeaderboardRow {
  rank: number;
  team: string;
  score: number;
}

interface LobbyStudent {
  id: string;
  name: string;
  section: string;
  group?: number; // assigned when game starts
  role?: string; // present from server for filtering
}

export default function TeacherDashboard() {
  const [chapters, setChapters] = useState({
    c1: true,
    c2: false,
    c3: false,
  });
  const [groups, setGroups] = useState(4);
  // const [lobbies, setLobbies] = useState<LobbyWithRelation[]>([]);
  const [numLobbies, setNumLobbies] = useState(1);
  const [selectedLobby, setSelectedLobby] = useState<string | null>(null);

  const session = useSession();
  const { socket } = useSocket();

  const [leaderboard] = useState<LeaderboardRow[]>([
    { rank: 1, team: "Team A", score: 980 },
    { rank: 2, team: "Team B", score: 870 },
    { rank: 3, team: "Team C", score: 760 },
  ]);

  const {
    data: lobbies = [],
    isLoading: areLobbiesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["lobbies"],
    queryFn: async () => {
      const res = await getLobbies();
      if (!res.success) throw new Error(res.error || "Failed to fetch lobbies");
      return res.data || [];
    },
    refetchInterval: 3000,
    refetchIntervalInBackground: true, // keep polling even if tab is hidden
  });

  const { mutate: mcreateLobby } = useMutation({
    mutationFn: createLobby,
    onSuccess: () => {
      console.log("lobbies created successfully");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
    },
  });

  const { mutate: mupdateLobby } = useMutation({
    mutationFn: updateLobby,
    onSuccess: () => {
      console.log("lobbies created successfully");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
    },
  });

  const { mutate: mdeleteLobby } = useMutation({
    mutationFn: deleteLobby,
    onSuccess: () => {
      console.log("lobbies created successfully");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
    },
  });

  const { mutate: mdeleteAllLobbies } = useMutation({
    mutationFn: deleteAllLobbies,
    onSuccess: () => {
      console.log("lobbies created successfully");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
    },
  });

  // Load saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("teacher_dashboard_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setChapters(parsed.chapters ?? chapters);
        setGroups(parsed.groups ?? groups);
        // setLobbies(parsed.lobbies ?? []);
      }
    } catch {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket connection for lobby monitoring
  useEffect(() => {
    if (!socket) return;

    return () => {};
  }, [socket]);

  const toggleChapter = (key: keyof typeof chapters) => {
    setChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    try {
      const payload = { chapters, groups, lobbies };
      localStorage.setItem(
        "teacher_dashboard_settings",
        JSON.stringify(payload)
      );
    } catch {
      // ignore
    }
  }, [chapters, groups, lobbies]);

  const createLobbies = () => {
    const newLobbies: LobbyWithRelation[] = [];
    for (let i = 1; i <= numLobbies; i++) {
      newLobbies.push({
        id: `lobby-${Date.now()}-${i}`,
        name: `Lobby ${randomCode(4)}`,
        createdAt: new Date(),
        createdBy: session.data?.user.name || "",
        maxPlayers: 4,
        status: "WAITING",
        users: [],
      });
    }
    // setLobbies((prev) => [...prev, ...newLobbies]);

    // Emit socket event to create lobbies on server
    if (socket) {
      socket.emit("createLobbies", { lobbies: newLobbies });
    }

    for (const newLobby of newLobbies) {
      mcreateLobby(newLobby);
    }

    alert(
      `Created ${numLobbies} new ${numLobbies === 1 ? "lobby" : "lobbies"}!`
    );
  };

  // const deleteLobby = (lobbyId: string) => {
  //   const lobbyToDelete = lobbies.find((l) => l.id === lobbyId);
  //   if (!lobbyToDelete) return;

  //   if (
  //     confirm(
  //       `Are you sure you want to delete "${lobbyToDelete.name}"? This action cannot be undone.`
  //     )
  //   ) {
  //     setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));

  //     // If the deleted lobby was selected, reset to main lobby
  //     if (selectedLobby === lobbyId) {
  //       setSelectedLobby(null);
  //     }

  //     // Emit socket event to delete lobby on server
  //     if (socket) {
  //       socket.emit("deleteLobby", { lobbyId });
  //     }
  //   }
  // };

  const startGame = () => {
    console.log("[teacher] startGame clicked");
    console.log("[teacher] socket:", socket);

    const currentStudents = selectedLobby
      ? lobbies.find((l) => l.id === selectedLobby)?.users
      : [];

    // console.log("[teacher] currentStudents.length:", currentStudents.length);

    // if (socket && currentStudents.length > 0) {
    //   console.log(
    //     "[teacher] Starting game for",
    //     currentStudents.length,
    //     "students"
    //   );
    //   socket.emit("startGame", {
    //     chapter: "chapter1",
    //     level: "level1",
    //     groups: groups,
    //     enabledChapters: chapters,
    //     lobbyId: selectedLobby, // Include lobby ID
    //   });
    //   console.log("[teacher] startGame event emitted");
    //   alert(
    //     `Game started! ${currentStudents.length} students will be redirected to Chapter 1.`
    //   );
    // } else {
    //   console.log(
    //     "[teacher] Cannot start game - socket:",
    //     !!socket,
    //     "students:",
    //     currentStudents.length
    //   );
    //   alert("No students in lobby to start the game.");
    // }
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

  const currentStudents = selectedLobby
    ? lobbies.find((l) => l.id === selectedLobby)?.users || []
    : [];

  return (
    <div
      style={{
        padding: 32,
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 350px 350px",
          gap: 28,
          alignItems: "start",
        }}
      >
        <section
          style={{
            background: "#111",
            padding: 28,
            borderRadius: 12,
            boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,204,102,0.06)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, color: "#ffcc66" }}>
            Class Controls
          </h2>
          <p style={{ marginTop: 8, color: "#ddd" }}>
            Lock or unlock chapters and configure the game.
          </p>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              background: "rgba(255,204,102,0.04)",
              borderRadius: 8,
              border: "1px solid rgba(255,204,102,0.1)",
            }}
          >
            <h3
              style={{ margin: "0 0 12px 0", fontSize: 16, color: "#ffcc66" }}
            >
              Create Multiple Lobbies
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <label style={{ color: "#ddd", fontWeight: 700 }}>
                Number of lobbies
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={numLobbies}
                onChange={(e) => setNumLobbies(Number(e.target.value))}
                style={{
                  width: 80,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "#0b0b0b",
                  color: "#fff",
                }}
              />
            </div>
            <button
              onClick={createLobbies}
              style={{
                background: "#ffcc66",
                color: "#000",
                border: "none",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Create Lobbies
            </button>
          </div>

          {lobbies.length > 0 && (
            <div
              style={{
                marginTop: 22,
                padding: 16,
                background: "rgba(255,204,102,0.04)",
                borderRadius: 8,
                border: "1px solid rgba(255,204,102,0.1)",
              }}
            >
              <h3
                style={{ margin: "0 0 12px 0", fontSize: 16, color: "#ffcc66" }}
              >
                Active Lobbies
              </h3>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {lobbies.map((lobby) => (
                  <div
                    key={lobby.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      marginBottom: 8,
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#ffcc66",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {lobby.name}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 12 }}>
                        {lobby.users.length} students • Created{" "}
                        {lobby.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => mdeleteLobby({ id: lobby.id })}
                      style={{
                        background: "#b80f2c",
                        color: "#fff",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => mdeleteAllLobbies()}
                style={{
                  background: "#b80f2c",
                  color: "#fff",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Delete All lobbies
              </button>
            </div>
          )}

          {lobbies.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <label
                style={{
                  color: "#ddd",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Select Active Lobby
              </label>
              <select
                value={selectedLobby || ""}
                onChange={(e) => setSelectedLobby(e.target.value || null)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "#0b0b0b",
                  color: "#fff",
                }}
              >
                <option value="">Main Lobby (Default)</option>
                {lobbies.map((lobby) => (
                  <option key={lobby.id} value={lobby.id}>
                    {lobby.name} ({lobby.users.length} students)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                checked={chapters.c1}
                onChange={() => toggleChapter("c1")}
              />
              <div>
                <div style={{ color: "#ffcc66", fontWeight: 700 }}>
                  Chapter 1: The Mirror of Truth
                </div>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  Path:{" "}
                  <code
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      padding: "2px 6px",
                      borderRadius: 6,
                      color: "#fff",
                    }}
                  >
                    /student/guide/page.tsx
                  </code>
                </div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                checked={chapters.c2}
                onChange={() => toggleChapter("c2")}
              />
              <div>
                <div style={{ color: "#ffcc66", fontWeight: 700 }}>
                  Chapter 2: The Equation of Clarity
                </div>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  Path: <em style={{ color: "#bbb" }}>/chapter-2</em>
                </div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                checked={chapters.c3}
                onChange={() => toggleChapter("c3")}
              />
              <div>
                <div style={{ color: "#ffcc66", fontWeight: 700 }}>
                  Chapter 3: The Lens of Vision
                </div>
                <div style={{ color: "#ccc", fontSize: 13 }}>
                  Path: <em style={{ color: "#bbb" }}>/chapter-3</em>
                </div>
              </div>
            </label>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <label style={{ color: "#ddd", fontWeight: 700 }}>
              Number of groups
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={groups}
              onChange={(e) => setGroups(Number(e.target.value))}
              style={{
                width: 80,
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "#0b0b0b",
                color: "#fff",
              }}
            />
          </div>

          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "#b80f2c",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Start game
            </button>
            <button
              onClick={() => {
                signOut({ redirectTo: "/" });
              }}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "8px 12px",
                borderRadius: 8,
                color: "#fff",
              }}
            >
              Logout
            </button>
          </div>
        </section>

        <aside
          style={{
            background: "#0f0f0f",
            padding: 22,
            borderRadius: 12,
            boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
            border: "1px solid rgba(64,224,208,0.06)",
          }}
        >
          <h3 style={{ margin: 0, color: "#40e0d0" }}>
            {selectedLobby
              ? `${lobbies.find((l) => l.id === selectedLobby)?.name} (${
                  currentStudents.length
                })`
              : `Live Lobby (${currentStudents.length})`}
          </h3>
          <p style={{ color: "#ddd", fontSize: 13, marginTop: 6 }}>
            Students currently in the lobby. Group badges appear after Start
            game.
          </p>

          {currentStudents.length === 0 ? (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 8,
                textAlign: "center",
                color: "#888",
              }}
            >
              No students in lobby
            </div>
          ) : (
            <div style={{ marginTop: 16, maxHeight: 300, overflowY: "auto" }}>
              {currentStudents
                .filter((s) =>
                  s.user.role ? s.user.role.toLowerCase() === "student" : true
                )
                .slice()
                .sort((a, b) =>
                  (a.lobby?.name || "").localeCompare(b.lobby?.name || "")
                )

                .map((student) => {
                  const groupColor = student.lobby.name
                    ? `hsl(${(getRandomInt(100) * 57) % 360} 70% 35%)`
                    : "rgba(64,224,208,0.35)";
                  return (
                    <div
                      key={student.id}
                      style={{
                        padding: "8px 12px",
                        marginBottom: 8,
                        background: "rgba(64,224,208,0.08)",
                        borderRadius: 8,
                        border: "1px solid rgba(64,224,208,0.15)",
                        position: "relative",
                      }}
                    >
                      {student.lobby && (
                        <div
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            background: groupColor,
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {student.lobby.name}
                        </div>
                      )}
                      <div
                        style={{
                          color: "#40e0d0",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {student.user.name}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 12 }}>
                        Section {student.user.section} • ID:{" "}
                        {student.id.slice(-4)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              padding: "8px 12px",
              background: "rgba(64,224,208,0.04)",
              borderRadius: 6,
              fontSize: 12,
              color: "#40e0d0",
            }}
          >
            Real-time update
          </div>

          {currentStudents.some((s) => s.lobby?.name) && (
            <div style={{ marginTop: 16 }}>
              <h4
                style={{ margin: "12px 0 4px", color: "#40e0d0", fontSize: 14 }}
              >
                Lobby Distribution
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Array.from(
                  new Set(
                    currentStudents
                      .filter((s) => s.lobby?.name)
                      .map((s) => s.lobby!.name)
                  )
                )
                  .sort((a, b) => a.localeCompare(b)) // alphabetical by lobby name
                  .map((lobbyName) => {
                    const members = currentStudents.filter(
                      (s) => s.lobby?.name === lobbyName
                    );
                    return (
                      <div
                        key={lobbyName}
                        style={{
                          background: "rgba(64,224,208,0.08)",
                          border: "1px solid rgba(64,224,208,0.25)",
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#40e0d0",
                          fontWeight: 600,
                        }}
                      >
                        {lobbyName}: {members.length}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </aside>

        <aside
          style={{
            background: "#0f0f0f",
            padding: 22,
            borderRadius: 12,
            boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,204,102,0.04)",
          }}
        >
          <h3 style={{ margin: 0, color: "#ffcc66" }}>Leaderboard (static)</h3>
          <p style={{ color: "#ddd", fontSize: 13, marginTop: 6 }}>
            Download as CSV for analysis.
          </p>

          <table
            style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <th style={{ padding: "8px 6px", color: "#fff" }}>#</th>
                <th style={{ padding: "8px 6px", color: "#fff" }}>Team</th>
                <th style={{ padding: "8px 6px", color: "#fff" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r) => (
                <tr
                  key={r.rank}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                >
                  <td
                    style={{
                      padding: "10px 6px",
                      color: "#ffcc66",
                      fontWeight: 700,
                    }}
                  >
                    {r.rank}
                  </td>
                  <td style={{ padding: "10px 6px" }}>{r.team}</td>
                  <td style={{ padding: "10px 6px" }}>{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              onClick={exportCSV}
              style={{
                background: "#ffcc66",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Export CSV
            </button>
            <button
              onClick={() =>
                alert(
                  "Static preview: CSV export and leaderboard are demo-only."
                )
              }
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "8px 12px",
                borderRadius: 8,
                color: "#fff",
              }}
            >
              Refresh
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
