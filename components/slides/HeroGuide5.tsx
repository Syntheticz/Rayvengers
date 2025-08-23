"use client";
import React from "react";
import Image from "next/image";

interface HeroGuide1Props {
  className?: string;
}

export default function HeroGuide5({ className = "slide active guide-slide" }: HeroGuide1Props) {
  return (
    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "32px", paddingBottom: "32px" }}>
      <h1 className="hero-guide-animated" style={{ fontFamily: "Bangers, cursive", fontSize: "clamp(1.5rem, 7vw, 2.5rem)", fontWeight: "bold", fontStyle: "italic", color: "#ffcc66", marginBottom: "18px", letterSpacing: "2px", textAlign: "center", width: "100%", maxWidth: "600px" }}>
        Images Formed by Curved Mirrors
      </h1>
      <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <Image src="/guide5.gif" alt="Combined Mirror Diagram" width={260} height={180} style={{ width: "100%", maxWidth: "260px", height: "auto", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", background: "#fff" }} priority />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#b80f2c", borderRadius: "18px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", border: "2px solid #ffcc66", padding: "18px 12px 16px 12px", marginBottom: "0", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontWeight: "bold", fontSize: "clamp(0.95rem, 2vw, 1.1rem)", marginBottom: "12px", textAlign: "left", display: "block", letterSpacing: "1px", color: "#fff" }}>
              <span style={{ color: "#ffcc66" }}>• Center of Curvature, C</span> - the center of the sphere of which the mirror is part. Its distance from the mirror is known as the radius.
              <br />
              <span style={{ color: "#ffcc66" }}>• Vertex, V</span> - the center of the mirror.
              <br />
              <span style={{ color: "#ffcc66" }}>• Focal Point/ Focus, F</span> - the point between the center of the curvature and vertex. Its distance from the mirror is known as the focal length, f.
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
