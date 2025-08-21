"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SliderProps {
  slides: React.ReactNode[];
}

const Slider: React.FC<SliderProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const totalSlides = slides.length;

  const showSlide = useCallback(
      (n: number) => {
        if (n >= totalSlides) {
          setCurrentSlide(totalSlides - 1);
        } else if (n < 0) {
          setCurrentSlide(0);
        } else {
          setCurrentSlide(n);
        }
      },
    [totalSlides]
  );

  const changeSlide = (direction: number) => {
    showSlide(currentSlide + direction);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") changeSlide(-1);
      if (e.key === "ArrowRight") changeSlide(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      const swipeThreshold = 50;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) changeSlide(-1); // Swipe right
        else changeSlide(1); // Swipe left
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSlide]);

  return (
    <div className="slider mx-auto text-center">
      <div className="slides relative">
        {React.cloneElement(slides[currentSlide] as React.ReactElement, {
          className: `${(slides[currentSlide] as any).props.className} slide active`,
        })}
      </div>

      {/* Navigation buttons */}
      <div
        className="navigation"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          margin: "32px 0 0 0",
        }}
      >
        <button
          className="nav-btn"
          id="prevBtn"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            background: "#c97a2d",
            color: "#8a0c1c",
            border: "none",
            borderRadius: "32px",
            fontWeight: "bold",
            fontSize: "clamp(0.5rem, 2vw, 1rem)",
            padding: "8px 0",
            minWidth: "90px",
            maxWidth: "120px",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
            letterSpacing: "2px",
            transition: "background 0.2s",
          }}
          onClick={() => changeSlide(-1)}
          disabled={currentSlide === 0}
        >
          <span style={{ marginRight: "6px" }}>◀</span>PREV
        </button>
        <button
          className="nav-btn"
          id="nextBtn"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            background: "#ffd600",
            color: "#8a0c1c",
            border: "none",
            borderRadius: "32px",
            fontWeight: "bold",
            fontSize: "clamp(0.8rem, 3vw, 1rem)",
            padding: "8px 0",
            minWidth: "90px",
            maxWidth: "120px",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
            letterSpacing: "2px",
            transition: "background 0.2s",
          }}
          onClick={() => changeSlide(1)}
          disabled={currentSlide === totalSlides - 1}
        >
          NEXT<span style={{ marginLeft: "6px" }}>▶</span>
        </button>
      </div>
    </div>
  );
};

export default Slider;
