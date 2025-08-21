"use client";
import { useState } from "react";


interface RoleSlideProps {
  className?: string;
}

import { useRouter } from "next/navigation";

export default function RoleSlide({ className = "slide active role-slide" }: RoleSlideProps) {
  const router = useRouter();
  return (
    <div
      className={className}
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#b80f2c",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontFamily: "Bangers, cursive",
          fontSize: "clamp(2rem, 7vw, 4rem)",
          fontWeight: "bold",
          fontStyle: "italic",
          color: "#ffcc66",
          marginBottom: "48px",
          letterSpacing: "2px",
          textAlign: "left",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        ARE YOU A...
      </h1>
      <div
        className="role-slide-row"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "clamp(32px, 10vw, 160px)",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* Teacher */}
        <button
          type="button"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            outline: "none",
            padding: 0,
            transition: "transform 0.1s",
          }}
          onClick={() => router.push("/teacher-auth")}
          aria-label="Select Teacher"
        >
          <div
            style={{
              width: "clamp(220px, 28vw, 340px)",
              height: "clamp(220px, 28vw, 340px)",
              borderRadius: "50%",
              background: "#7ec6e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginBottom: "24px",
              boxShadow: "0 0 0 0 #fff",
            }}
          >
            <img
              src="/teacher.png"
              alt="Teacher"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transition: "transform 0.1s",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "Bangers, cursive",
              fontSize: "clamp(1.7rem, 4vw, 3.2rem)",
              color: "#ffcc66",
              fontWeight: "bold",
              letterSpacing: "2px",
              marginTop: "8px",
            }}
          >
            TEACHER
          </span>
        </button>
        {/* Learner */}
        <button
          type="button"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            outline: "none",
            padding: 0,
            transition: "transform 0.1s",
          }}
          onClick={() => router.push("/student-auth")}
          aria-label="Select Learner"
        >
          <div
            style={{
              width: "clamp(220px, 28vw, 340px)",
              height: "clamp(220px, 28vw, 340px)",
              borderRadius: "50%",
              background: "#7ec6e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginBottom: "24px",
              boxShadow: "0 0 0 0 #fff",
            }}
          >
            <img
              src="/student.png"
              alt="Learner"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transition: "transform 0.1s",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "Bangers, cursive",
              fontSize: "clamp(1.7rem, 4vw, 3.2rem)",
              color: "#ffcc66",
              fontWeight: "bold",
              letterSpacing: "2px",
              marginTop: "8px",
            }}
          >
            LEARNER
          </span>
        </button>
      </div>
    </div>
  );
}
