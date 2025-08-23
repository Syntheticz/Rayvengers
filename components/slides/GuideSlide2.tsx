"use client";

interface GuideSlide2Props {
  className?: string;
}

export default function GuideSlide2({ className = "slide active guide-slide" }: GuideSlide2Props) {
  return (
    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "64px", paddingBottom: "64px" }}>
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
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(1.1rem, 4vw, 1.7rem)", color: "#ffcc66", fontWeight: "bold", marginBottom: "16px", textAlign: "left" }}>Power Points</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> In every Level, your team will earn Points.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> The faster you finish the task, the higher your score will be!</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> Your total score will show the strength of your team against the Shadow.</li>
          </ul>
        </div>
        <div className="guide-section" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(1.1rem, 4vw, 1.7rem)", color: "#ffcc66", fontWeight: "bold", marginBottom: "16px", textAlign: "left" }}>Boss Levels</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> At the end of each Chapter, a powerful Boss Challenge awaits.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> This is the hardest test that measures your knowledge, speed, and teamwork.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> You must defeat the Boss to move on to the next Chapter.</li>
          </ul>
        </div>
        <div className="guide-section" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(1.1rem, 4vw, 1.7rem)", color: "#ffcc66", fontWeight: "bold", marginBottom: "16px", textAlign: "left" }}>Reward Chips</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> At the end of each Chapter, the team with the highest score will earn five (5) Reward Chips of Light.</li>
            <li style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(0.5rem, 3vw, 1.1rem)", color: "#fff", marginBottom: "16px", lineHeight: "1.7", fontWeight: "bold", textAlign: "left" }}> These chips are proof of your courage, teamwork, and brilliance as RayVengers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
