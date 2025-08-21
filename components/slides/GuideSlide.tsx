"use client";

interface GuideSlideProps {
  className?: string;
}

export default function GuideSlide({ className = "slide active guide-slide" }: GuideSlideProps) {
  return (
    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1
        style={{
          fontFamily: "Bangers, cursive",
          fontSize: "clamp(1.5rem, 7vw, 4rem)",
          fontWeight: "bold",
          fontStyle: "italic",
          color: "#ffcc66",
          marginBottom: "32px",
          letterSpacing: "2px",
          textAlign: "left",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        HOW TO NAVIGATE THE QUESTS?
      </h1>
      <div className="guide-content" style={{ width: "100%", maxWidth: "1200px", textAlign: "left", padding: "0 2vw" }}>
        <div className="guide-section" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(1.1rem, 4vw, 1.7rem)", color: "#ffcc66", fontWeight: "bold", marginBottom: "16px", textAlign: "left" }}>Levels of Light</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> Your team will pass through different Levels.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> Each Level has a Task that you must complete.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> When a Level is finished, the next one will unlock.</li>
          </ul>
        </div>
        <div className="guide-section" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(1.1rem, 4vw, 1.7rem)", color: "#ffcc66", fontWeight: "bold", marginBottom: "16px", textAlign: "left" }}>Team Roles</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> Every RayVenger in the group has an important role.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> The Teacher (Guide) will assign the tasks, and each member must do their part for the group to succeed.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> Remember: No hero wins the battle alone.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
