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
        setCurrentSlide(0);
      } else if (n < 0) {
        setCurrentSlide(totalSlides - 1);
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
    <div className="slider max-w-lg mx-auto text-center">
      <div className="slides relative">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide transition-opacity duration-500 ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 absolute inset-0"
            }`}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <button
          id="prevBtn"
          onClick={() => changeSlide(-1)}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          id="nextBtn"
          onClick={() => changeSlide(1)}
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Slider;
