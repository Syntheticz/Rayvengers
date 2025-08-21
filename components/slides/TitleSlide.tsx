"use client";

interface TitleSlideProps {
  className?: string;
}

export default function TitleSlide({ className = "slide active title-slide" }: TitleSlideProps) {
  return (
    <div className={className} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ fontFamily: "Bangers, cursive", fontSize: "clamp(2.2rem, 8vw, 7rem)", fontWeight: "bold", textShadow: "3px 3px 6px rgba(0,0,0,0.7)", marginBottom: "30px", letterSpacing: "5px", lineHeight: 1.1, textAlign: "center" }}>
        RAYVENGERS:<br />HEROES OF LIGHT
      </h1>
      <h2 style={{ fontFamily: "Anton, sans-serif", fontStyle: "oblique", fontSize: "clamp(1.3rem, 5vw, 2.5rem)", fontWeight: "normal", textShadow: "2px 2px 4px rgba(0,0,0,0.7)", letterSpacing: "2px", marginBottom: "50px", textAlign: "center", color: "#fff"}}>
        GAMIFIED MATERIAL FOR MIRRORS AND LENSES
      </h2>
    </div>
  );
}

