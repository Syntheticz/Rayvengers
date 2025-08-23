"use client";
import React from "react";
import Image from "next/image";

interface HeroGuide1Props {
  className?: string;
}

export default function HeroGuide1({ className = "slide active guide-slide" }: HeroGuide1Props) {
  return (
    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "32px", paddingBottom: "80px" }}>
      <h1 className="hero-guide-animated" style={{ fontFamily: "Bangers, cursive", fontSize: "clamp(1.5rem, 7vw, 2.5rem)", fontWeight: "bold", fontStyle: "italic", color: "#ffcc66", marginBottom: "18px", letterSpacing: "2px", textAlign: "center", width: "100%", maxWidth: "600px" }}>
        The ‘Four Principal Rays’ in Curved Mirrors
      </h1>
      <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <span style={{ fontFamily: "'Press Start 2P', cursive", color: "#fff", fontWeight: "bold", fontSize: "clamp(1rem, 3vw, 1.3rem)", textAlign: "center", marginBottom: "18px", width: "100%" }}>
          Images formed in a curved mirror can be located and described through ray diagramming.
        </span>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <Image src="/guide6.png" alt="Ray Diagramming Example 1" width={320} height={180} style={{ width: "100%", maxWidth: "320px", height: "auto", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", background: "#fff" }} priority />
          <Image src="/guide7.png" alt="Ray Diagramming Example 2" width={320} height={180} style={{ width: "100%", maxWidth: "320px", height: "auto", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", background: "#fff" }} priority />
        </div>
        <div style={{ width: "100%", maxWidth: "650px", margin: "32px auto 0 auto", background: "rgba(255,255,255,0.07)", borderRadius: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "2px solid #ffcc66", padding: "32px 22px", color: "#fff", fontFamily: "'Press Start 2P', cursive", fontWeight: "bold", fontSize: "clamp(0.95rem, 2vw, 1.15rem)", lineHeight: "1.8", textAlign: "left" }}>
          <span style={{ color: "#ffcc66" }}>Ray diagramming steps using the ‘Four Principal Rays’</span> in determining the position and the nature of the image of an object formed by <span style={{ color: "#ffcc66" }}>concave mirror</span> and <span style={{ color: "#ffcc66" }}>convex mirror</span>.<br /><br />
          <span style={{ color: "#ffcc66" }}>1.</span> From the object, draw the first ray (<span style={{ color: "#ffcc66" }}>P – F ray</span>). From the same point on the object, draw the second (<span style={{ color: "#ffcc66" }}>F – P ray</span>), third (<span style={{ color: "#ffcc66" }}>C – C ray</span>), and fourth (<span style={{ color: "#ffcc66" }}>V ray</span>) rays.<br /><br />
          <span style={{ color: "#ffcc66" }}>2.</span> The intersection of the four rays is the <span style={{ color: "#ffcc66" }}>image point</span> corresponding to the object point. If you started diagramming from the tip of the arrow-shaped object, the intersection of the reflected rays is also the tip of the arrow-shaped image. Thus, you can determine completely the <span style={{ color: "#ffcc66" }}>position</span> and <span style={{ color: "#ffcc66" }}>characteristics</span> of the image.<br /><br />
          <span style={{ color: "#ffcc66" }}>3.</span> For a <span style={{ color: "#ffcc66" }}>convex mirror</span>, light rays <span style={{ color: "#ffcc66" }}>diverge</span> after reflection and converge from a point that seems to be behind the mirror (<span style={{ color: "#ffcc66" }}>virtual focus</span>); but the procedure for locating images is the same as for <span style={{ color: "#ffcc66" }}>concave mirror</span>.
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
