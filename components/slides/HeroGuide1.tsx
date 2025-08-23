"use client";
import React from "react";
import Image from "next/image";

interface HeroGuide1Props {
  className?: string;
}

export default function HeroGuide1({ className = "slide active guide-slide" }: HeroGuide1Props) {
  return (

    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "32px", paddingBottom: "32px" }}>
      <h1 className="hero-guide-animated" style={{ fontFamily: "Bangers, cursive", fontSize: "clamp(1.5rem, 7vw, 2.5rem)", fontWeight: "bold", fontStyle: "italic", color: "#ffcc66", marginBottom: "18px", letterSpacing: "2px", textAlign: "center", width: "100%", maxWidth: "600px" }}>
        HERO GUIDE
      </h1>
      <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <Image src="/guide1.gif" alt="Animated Reflection Diagram" width={260} height={180} style={{ width: "100%", maxWidth: "260px", height: "auto", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", background: "#fff" }} priority />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            {
              title: "REFECTION",
              text: "is the bouncing off of light rays when it hits a surface like a plane mirror.",
            },
            {
              title: "INCIDENT RAY.",
              text: "Ray of light approaching the mirror represented by an arrow approaching the mirror",
            },
            {
              title: "REFLECTED RAY.",
              text: "Ray of light which leaves the mirror and is represented by an arrow pointing away from the mirror.",
            },
            {
              title: "NORMAL LINE.",
              text: "An imaginary line that can be drawn perpendicular to the surface of the mirror at the point of incidence where the ray strikes the mirror",
            },
            {
              title: "ANGLE OF INCIDENCE.",
              text: "Angle between the incident ray and the normal line.",
            },
            {
              title: "ANGLE OF REFLECTION.",
              text: "Angle between the reflected ray and the normal line",
            },
          ].map((item, idx) => (
            <div key={item.title} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1.5px solid #ffcc66", padding: "14px 16px", marginBottom: "0", display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#ffcc66", fontWeight: "bold", fontSize: "clamp(0.9rem, 3vw, 1.2rem)", marginBottom: "6px" }}>{item.title}</span>
              <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontWeight: "bold", fontSize: "clamp(0.7rem, 2vw, 1rem)", marginLeft: 8 }}>{item.text}</span>
            </div>
          ))}
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
