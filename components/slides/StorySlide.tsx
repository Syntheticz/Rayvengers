"use client";

interface StorySlideProps {
  className?: string;
}

export default function StorySlide({ className = "slide active story-slide" }: StorySlideProps) {
  return (
    <div className={className}>
      <h1
        style={{
          fontFamily: "Bangers, sans-serif",
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: "bold",
          color: "#ffcc66",
          marginBottom: "30px",
          letterSpacing: "2px",
          textAlign: "left",
        }}
      >
        BACK STORY...
      </h1>
      <div
        className="story-content"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "#fff",
            textAlign: "left",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2vw",
            lineHeight: "2",
          }}
      >
        <p>
          In a world where darkness threatens to engulf knowledge, only one force can restore clarity—
          <span className="highlight" style={{ color: "#ffe600", fontWeight: "bold" }}>
            the power of light
          </span>.
        </p>
        <p>
          But light alone is not enough. To unlock its full potential, heroes must master the secrets of
          <span className="highlight" style={{ color: "#ffe600", fontWeight: "bold" }}>
            {" "}reflection and refraction
          </span>.
        </p>
        <p>
          The <span className="highlight" style={{ color: "#ffcc66", fontWeight: "bold" }}>RayVengers</span>, a team of young scientists, are tasked to protect the Earth from a growing &quot;Shadow of Ignorance&quot; that clouds people&apos;s understanding of science.
        </p>
        <p className="mission-text">
          Your mission is to join the <span className="highlight" style={{ color: "#ffcc66", fontWeight: "bold" }}>RayVengers</span> and harness the power of mirrors and lenses.
        </p>
        <p className="mission-text">Are you up for the mission?</p>
      </div>
    </div>
  );
}