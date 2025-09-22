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
import { useState } from "react";

export default function LobbyList() {
  const router = useRouter();
  const session = useSession();
  const [isAlreadyInALobby, setIsAlreadyInALobby] = useState(false);

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

  const { mutate: mjoinUserLobby } = useMutation({
    mutationFn: joinUserLobby,
    onSuccess: () => {
      console.log("Successfull Operation");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
    },
  });

  const { mutate: mtransferUserLobby } = useMutation({
    mutationFn: transferUserLobby,
    onSuccess: () => {
      console.log("Successfull Operation");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
    },
  });

  const { mutate: mremoveUserFromLobby } = useMutation({
    mutationFn: removeUserFromLobby,
    onSuccess: () => {
      console.log("Successfull Operation");
    },
    onError: (data) => {
      console.log("There was an error.");
      console.log(data.message);
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
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => {
              if (isAlreadyInALobby) {
                mtransferUserLobby({
                  lobbyId: lobby.id,
                  userId: session.data?.user.id || "",
                });
              } else {
                mjoinUserLobby({
                  lobbyId: lobby.id,
                  userId: session.data?.user.id || "",
                });
                console.log("joined Lobby ", lobby.name);
                setIsAlreadyInALobby(true);
              }
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

            <button
              style={{
                background: "#28a745",
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
                console.log(`Joining lobby ${lobby.id}`);
              }}
            >
              Join Lobby
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
