"use client";
import {
  getLobbies,
  joinUserLobby,
  removeUserFromLobby,
  transferUserLobby,
} from "@/lib/actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import { useSocket } from "@/lib/providers/socket-provider";

export default function LobbyList() {
  const router = useRouter();
  const session = useSession();
  const { socket } = useSocket();

  const {
    data: lobbies = [],
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

  // Check if user is already in a lobby and which one
  const currentUserLobby = useMemo(() => {
    if (!session.data?.user.id) return null;
    
    for (const lobby of lobbies) {
      const userInLobby = lobby.users.find(
        (lobbyUser) => lobbyUser.userId === session.data.user.id
      );
      if (userInLobby) {
        return lobby;
      }
    }
    return null;
  }, [lobbies, session.data?.user.id]);

  // Auto-join socket room if already in a lobby
  useEffect(() => {
    if (currentUserLobby && socket) {
      socket.emit("joinLobby", { lobbyId: currentUserLobby.id });
      console.log("🔌 Auto-joined socket room:", currentUserLobby.id);
    }
  }, [currentUserLobby, socket]);

  // Listen for game start event
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data: {
      chapter: string;
      level: string;
      lobbyKey: string;
    }) => {
      console.log("🎮 [Student] Game started!", data);
      console.log(`   ↳ Redirecting to ${data.chapter} intro page`);
      
      // Redirect to the chapter intro page (which will auto-redirect to the level after 3s)
      router.push(`/game/${data.chapter}`);
    };

    socket.on("gameStarted", handleGameStarted);

    return () => {
      socket.off("gameStarted", handleGameStarted);
    };
  }, [socket, router]);

  const { mutate: mjoinUserLobby } = useMutation({
    mutationFn: joinUserLobby,
    onSuccess: (data, variables) => {
      console.log("Successfully joined lobby");
      // Emit socket event to join the lobby room
      if (socket) {
        socket.emit("joinLobby", { lobbyId: variables.lobbyId });
        console.log("🔌 Joined socket room:", variables.lobbyId);
      }
    },
    onError: (data) => {
      console.log("Error joining lobby:", data.message);
    },
  });

  const { mutate: mtransferUserLobby } = useMutation({
    mutationFn: transferUserLobby,
    onSuccess: (data, variables) => {
      console.log("Successfully transferred to new lobby");
      // Emit socket event to join the new lobby room
      if (socket) {
        socket.emit("joinLobby", { lobbyId: variables.lobbyId });
        console.log("🔌 Transferred to socket room:", variables.lobbyId);
      }
    },
    onError: (data) => {
      console.log("Error transferring lobby:", data.message);
    },
  });

  const { mutate: mremoveUserFromLobby } = useMutation({
    mutationFn: removeUserFromLobby,
    onSuccess: () => {
      console.log("Successfully left lobby");
    },
    onError: (data) => {
      console.log("Error leaving lobby:", data.message);
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "32px 16px",
      }}
    >
      <h1
        style={{
          fontFamily: "Bangers, cursive",
          color: "#b80f2c",
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "32px",
          letterSpacing: "2px",
          textAlign: "center",
        }}
      >
        Game Lobbies
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {lobbies.map((lobby) => (
          <div
            key={lobby.id}
            style={{
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              padding: "24px",
              position: "relative",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#b80f2c",
                  fontSize: "1.1rem",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                {lobby.name}
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  fontFamily: "'Press Start 2P', cursive",
                }}
              >
                <span style={{ color: "#666" }}>
                  {lobby.users.length}/{lobby.maxPlayers} Players
                </span>
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  color: "#333",
                  fontSize: "0.8rem",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                Players
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {lobby.users.map((lobbyUser, i) => {
                  console.log(lobbyUser);
                  return (
                    <li
                      key={i}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        color: "#333",
                        fontSize: "0.7rem",
                        marginBottom: "8px",
                        textAlign: "center",
                      }}
                    >
                      {lobbyUser.user.name}{" "}
                      <span style={{ color: "#b80f2c" }}>
                        [{lobbyUser.user.section}]
                      </span>
                    </li>
                  );
                })}
              </ul>

              {lobby.users.length < lobby.maxPlayers && (
                <div style={{ marginTop: "8px", textAlign: "center" }}>
                  {Array.from({
                    length: lobby.maxPlayers - lobby.users.length,
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      style={{
                        fontFamily: "'Press Start 2P', cursive",
                        color: "#ccc",
                        fontSize: "0.7rem",
                        marginBottom: "8px",
                        fontStyle: "italic",
                      }}
                    >
                      Empty Slot
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Indicator if user is in this lobby */}
            {currentUserLobby?.id === lobby.id && (
              <div
                style={{
                  background: "#28a745",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "0.6rem",
                  marginTop: "12px",
                }}
              >
                ✓ You&apos;re in this lobby
              </div>
            )}

            <button
              style={{
                background:
                  currentUserLobby?.id === lobby.id
                    ? "#dc3545"
                    : currentUserLobby
                    ? "#ffc107"
                    : "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: "700",
                fontFamily: "Bangers, cursive",
                fontSize: "0.9rem",
                cursor: "pointer",
                width: "100%",
                marginTop: "16px",
                letterSpacing: "2px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                
                // If already in this lobby, leave it
                if (currentUserLobby?.id === lobby.id) {
                  mremoveUserFromLobby({
                    userId: session.data?.user.id || "",
                    lobbyId: lobby.id,
                  });
                  console.log("Left lobby:", lobby.name);
                }
                // If in a different lobby, transfer
                else if (currentUserLobby) {
                  mtransferUserLobby({
                    lobbyId: lobby.id,
                    userId: session.data?.user.id || "",
                  });
                  console.log("Transferred to lobby:", lobby.name);
                }
                // If not in any lobby, join
                else {
                  mjoinUserLobby({
                    lobbyId: lobby.id,
                    userId: session.data?.user.id || "",
                  });
                  console.log("Joined lobby:", lobby.name);
                }
              }}
            >
              {currentUserLobby?.id === lobby.id
                ? "Leave Lobby"
                : currentUserLobby
                ? "Switch Lobby"
                : "Join Lobby"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/student/guide")}
        style={{
          background: "#b80f2c",
          color: "#ffcc66",
          border: "none",
          borderRadius: "8px",
          padding: "12px 28px",
          fontWeight: "700",
          fontFamily: "Bangers, cursive",
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginTop: "32px",
        }}
      >
        Back
      </button>
    </div>
  );
}
