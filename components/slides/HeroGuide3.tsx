"use client";
import React from "react";
import Image from "next/image";

interface HeroGuide1Props {
  className?: string;
}

export default function HeroGuide3({ className = "slide active guide-slide" }: HeroGuide1Props) {
  return (
    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "32px", paddingBottom: "32px" }}>
      <h1 className="hero-guide-animated" style={{ fontFamily: "Bangers, cursive", fontSize: "clamp(1.5rem, 7vw, 2.5rem)", fontWeight: "bold", fontStyle: "italic", color: "#ffcc66", marginBottom: "18px", letterSpacing: "2px", textAlign: "center", width: "100%", maxWidth: "600px" }}>
        REFLECTION IN CURVED MIRROR
      </h1>
      <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <Image src="/guide2.gif" alt="Curved Mirror Diagram" width={260} height={180} style={{ width: "100%", maxWidth: "260px", height: "auto", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", background: "#fff" }} priority />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#b80f2c", borderRadius: "18px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", border: "2px solid #ffcc66", padding: "18px 12px 16px 12px", marginBottom: "0", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#ffcc66", fontWeight: "bold", fontSize: "clamp(1rem, 3vw, 1.2rem)", marginBottom: "10px", textAlign: "left", display: "block", letterSpacing: "1px" }}>
              REFLECTION IN CURVED MIRROR
            </span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontWeight: "bold", fontSize: "clamp(0.85rem, 2vw, 1.1rem)", marginBottom: "16px", textAlign: "left", display: "block" }}>
              A curved mirror is a reflecting surface in which its surface is a section of sphere
            </span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#ffcc66", fontWeight: "bold", fontSize: "clamp(0.95rem, 2vw, 1.1rem)", marginBottom: "12px", textAlign: "left", display: "block", letterSpacing: "1px" }}>
              Two Kinds of Spherical Mirrors:
            </span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontWeight: "bold", fontSize: "clamp(0.85rem, 2vw, 1.1rem)", marginBottom: "8px", textAlign: "left", display: "block" }}>
              1. The <span style={{ color: "#ffcc66" }}>Concave Mirror</span><br />It is a curved mirror in which the reflective surface bulges away from the light source.
            </span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontWeight: "bold", fontSize: "clamp(0.85rem, 2vw, 1.1rem)", textAlign: "left", display: "block" }}>
              • It is called <span style={{ color: "#ffcc66" }}>Converging Mirror</span> because the parallel incident rays converge or meet/intersect at a focal point after reflection.
            </span>
          </div>
        </div>
      </div>
      <style>{`
        .hero-guide-animated {
          animation: heroGlow 2.2s infinite alternate;
        }
        @keyframes heroGlow {
          0% {
            text-shadow: 0 0 8px #ffcc66, 0 0 16px #b80f2c;
            color: #ffcc66;
          }
          100% {
            text-shadow: 0 0 24px #ffcc66, 0 0 32px #b80f2c;
            color: #fffbe6;
          }
        }
        @media (max-width: 700px) {
          .hero-guide-animated {
            font-size: 1.3rem !important;
            max-width: 98vw !important;
          }
          div[style*='max-width: 600px'] {
            max-width: 98vw !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
