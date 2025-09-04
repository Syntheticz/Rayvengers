"use client";
import Slider from "@/components/slider";
import HeroGuide1 from "@/components/slides/HeroGuide1";
import HeroGuide2 from "@/components/slides/HeroGuide2";
import HeroGuide3 from "@/components/slides/HeroGuide3";
import HeroGuide4 from "@/components/slides/HeroGuide4";
import HeroGuide5 from "@/components/slides/HeroGuide5";
import HeroGuide6 from "@/components/slides/HeroGuide6";
import { signOut } from "next-auth/react";

import { useRouter } from "next/navigation";

export default function StudentGuide() {
  const router = useRouter();
  const slides = [
    <HeroGuide1 key="guide1" />,
    <HeroGuide2 key="guide2" />,
    <HeroGuide3 key="guide3" />,
    <HeroGuide4 key="guide4" />,
    <HeroGuide5 key="guide5" />,
    <HeroGuide6 key="guide6" />,
  ];
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center w-screen"
      style={{ position: "relative", paddingTop: "72px" }}
    >
      <button
        onClick={async () => {
          try {
            await signOut({
              redirect: false,
              callbackUrl: "/",
            });
            window.location.href = "/";
          } catch (error) {
            console.error("Logout failed:", error);
          }
        }}
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          background: "#b80f2c",
          color: "#ffcc66",
          border: "none",
          borderRadius: 8,
          padding: "10px 18px",
          fontWeight: 700,
          fontFamily: "Bangers, cursive",
          fontSize: "1.1rem",
          cursor: "pointer",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        Logout
      </button>
      <Slider
        slides={slides}
        onLastNext={() => {
          location.href = "/student/lobby";
        }}
      />
    </main>
  );
}
