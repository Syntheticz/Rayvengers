"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Chapter1Level1() {
  const router = useRouter();

  const handleBackToLobby = () => {
    router.push("/student/lobby");
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "16px",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      {/* Back button in top left */}
      <button
        onClick={handleBackToLobby}
        style={{ 
          position: "absolute",
          top: "16px",
          left: "16px",
          background: "#ffcc66", 
          border: "none", 
          color: "#b80f2c", 
          padding: "12px 20px", 
          borderRadius: "12px", 
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          fontFamily: "Bangers, cursive",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease"
        }}
      >
        ← Back to Lobby
      </button>

      {/* Main Title in the center */}
      <h1 style={{ 
        color: "#ffcc66", 
        fontSize: "clamp(1.8rem, 8vw, 3rem)", 
        fontWeight: "bold", 
        margin: 0,
        fontFamily: "'Press Start 2P', cursive",
        textAlign: "center",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        lineHeight: "1.2",
        maxWidth: "90%"
      }}>
        Level 1 – The Light Seeker
      </h1>
    </div>
  );
}
