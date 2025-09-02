"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Chapter1Overview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  useEffect(() => {
    const timer = setTimeout(() => {
      const levelPath = sessionId 
        ? `/game/chapter1/level1?session=${sessionId}`
        : `/game/chapter1/level1`;
      router.push(levelPath);
    }, 3000); 

    return () => clearTimeout(timer);
  }, [router, sessionId]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "32px 0",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      {/* Header */}
      <h1 style={{ 
        fontFamily: "Bangers, cursive", 
        color: "#ffcc66", 
        fontSize: "2.5rem", 
        fontWeight: "bold", 
        marginBottom: "40px", 
        letterSpacing: "3px", 
        textAlign: "center",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
      }}>
        learner&#39;s interface
      </h1>

      {/* Chapters Display */}
      <div style={{ 
        display: "flex", 
        gap: "80px", 
        alignItems: "center", 
        justifyContent: "center",
        marginBottom: "60px"
      }}>
        {/* Chapter 1 - Unlocked */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "20px" 
        }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            background: "#fff", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            {/* Unlocked padlock */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10" 
                    stroke="#b80f2c" strokeWidth="2" strokeLinecap="round"/>
              <rect x="4" y="10" width="16" height="10" rx="2" fill="#b80f2c"/>
              <circle cx="12" cy="15" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ 
              color: "#fff", 
              fontSize: "1.4rem", 
              fontWeight: "bold", 
              margin: "0 0 8px 0",
              fontFamily: "'Press Start 2P', cursive"
            }}>
              Chapter 1
            </h3>
            <p style={{ 
              color: "#ffcc66", 
              fontSize: "1rem", 
              margin: 0,
              fontWeight: "600"
            }}>
              The Mirror of Truth
            </p>
          </div>
        </div>

        {/* Chapter 2 - Locked */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "20px",
          opacity: "0.6"
        }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            background: "#fff", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            {/* Locked padlock */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10" 
                    stroke="#888" strokeWidth="2" strokeLinecap="round"/>
              <rect x="4" y="10" width="16" height="10" rx="2" fill="#888"/>
              <circle cx="12" cy="15" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ 
              color: "#ccc", 
              fontSize: "1.4rem", 
              fontWeight: "bold", 
              margin: "0 0 8px 0",
              fontFamily: "'Press Start 2P', cursive"
            }}>
              Chapter 2
            </h3>
            <p style={{ 
              color: "#aaa", 
              fontSize: "1rem", 
              margin: 0,
              fontWeight: "600"
            }}>
              The Equation of Clarity
            </p>
          </div>
        </div>

        {/* Chapter 3 - Locked */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "20px",
          opacity: "0.6"
        }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            background: "#fff", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            {/* Locked padlock */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10" 
                    stroke="#888" strokeWidth="2" strokeLinecap="round"/>
              <rect x="4" y="10" width="16" height="10" rx="2" fill="#888"/>
              <circle cx="12" cy="15" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ 
              color: "#ccc", 
              fontSize: "1.4rem", 
              fontWeight: "bold", 
              margin: "0 0 8px 0",
              fontFamily: "'Press Start 2P', cursive"
            }}>
              Chapter 3
            </h3>
            <p style={{ 
              color: "#aaa", 
              fontSize: "1rem", 
              margin: 0,
              fontWeight: "600"
            }}>
              The Lens of Vision
            </p>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px",
        color: "#ffcc66",
        fontSize: "1.1rem",
        fontWeight: "600"
      }}>
        <div style={{ 
          width: "20px", 
          height: "20px", 
          border: "3px solid rgba(255,204,102,0.3)", 
          borderTop: "3px solid #ffcc66", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }}></div>
        Loading Chapter 1...
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
