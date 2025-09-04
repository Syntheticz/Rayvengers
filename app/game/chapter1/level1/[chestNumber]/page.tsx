"use client";
import { useSocket } from "@/lib/providers/socket-provider";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface Question {
  id: string;
  question: string;
  description: string;
  target: string;
}

const CHEST_QUESTIONS: Record<string, Question> = {
  "1": {
    id: "chest1",
    question: "Concave Mirror - Focal Point",
    description: "Click on the focal point (F) in the diagram",
    target: "focal-point",
  },
  "2": {
    id: "chest2",
    question: "Concave Mirror - Center of Curvature",
    description: "Click on the center of curvature (C) in the diagram",
    target: "center-curvature",
  },
  "3": {
    id: "chest3",
    question: "Concave Mirror - Principal Axis",
    description: "Click on the principal axis in the diagram",
    target: "principal-axis",
  },
  "4": {
    id: "chest4",
    question: "Concave Mirror - Mirror Surface",
    description: "Click on the concave mirror surface in the diagram",
    target: "concave-mirror",
  },
};

export default function ChestQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const chestNumber = params.chestNumber as string;

  const { socket } = useSocket();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [attempts, setAttempts] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);

  const questionData = CHEST_QUESTIONS[chestNumber];

  // Debug: lifecycle
  useEffect(() => {
    console.log("[ChestQuestionPage] mount chest", chestNumber);
    return () => console.log("[ChestQuestionPage] unmount chest", chestNumber);
  }, [chestNumber]);

  useEffect(() => {
    if (!socket) return;
    if (!questionData) {
      router.push("/game/chapter1/level1");
      return;
    }

    socket.on("connect", () => {
      console.log(`Connected to server for chest ${chestNumber}`);
      const questionId = `chest${chestNumber}`;
      socket.emit("claimQuestion", { questionId });
      setLoading(false);
    });

    socket.on("gameCompleted", (payload: any) => {
      console.log("[ChestQuestionPage] gameCompleted received", payload);
      const chap = payload?.chapter || "chapter1";
      const lvl = payload?.level || "level1";
      router.push(`/game/level-passed?chapter=${chap}&level=${lvl}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [chestNumber, questionData, socket]);

  const handleElementClick = (elementType: string) => {
    if (isCompleted) return; // ignore after completion
    setSelectedElement(elementType);

    if (!socket) {
      console.log("[handleElementClick] no socket yet");
    }

    const isCorrect = elementType === questionData.target;
    const questionId = `chest${chestNumber}`;
    console.log("[handleElementClick] attempt", {
      elementType,
      isCorrect,
      attemptsBefore: attempts,
    });

    setAttempts((prev) => {
      const updated = prev + 1;
      console.log("[attempts] increment (click)", { prev, updated });
      if (socket) {
        console.log("[socket.emit] submitAnswer", {
          questionId,
          answer: elementType,
          isCorrect,
          attempts: updated,
        });
        socket.emit("submitAnswer", {
          questionId,
          answer: elementType,
          isCorrect,
          attempts: updated,
        });
      }
      return updated;
    });

    setFeedback({
      message: isCorrect
        ? `🎉 Excellent! You found the ${questionData.target.replace(
            "-",
            " "
          )}!`
        : `❌ You selected the ${elementType.replace("-", " ")}. Try again!`,
      isCorrect,
    });

    if (isCorrect) {
      setIsCompleted(true);
    }
  };

  useEffect(() => {
    console.log("[attempts] state changed ->", attempts);
  }, [attempts]);

  const getChestContent = () => {
    if (!questionData) return null;

    const baseStyle = {
      background: "#f8f9fa",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
    };

    const svgStyle = {
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      background: "#fff",
    };

    return (
      <div style={baseStyle}>
        <svg width="100%" height="300" viewBox="0 0 600 250" style={svgStyle}>
          {/* Principal Axis */}
          <line
            x1="50"
            y1="125"
            x2="450"
            y2="125"
            stroke={selectedElement === "principal-axis" ? "#e74c3c" : "#000"}
            strokeWidth={selectedElement === "principal-axis" ? "4" : "2"}
            onClick={() => handleElementClick("principal-axis")}
            style={{ cursor: "pointer" }}
          />

          {/* Center of Curvature */}
          <circle
            cx="200"
            cy="125"
            r="6"
            fill={selectedElement === "center-curvature" ? "#e74c3c" : "#000"}
            onClick={() => handleElementClick("center-curvature")}
            style={{ cursor: "pointer" }}
          />

          {/* Focal Point */}
          <circle
            cx="300"
            cy="125"
            r="6"
            fill={selectedElement === "focal-point" ? "#e74c3c" : "#000"}
            onClick={() => handleElementClick("focal-point")}
            style={{ cursor: "pointer" }}
          />

          {/* Concave Mirror */}
          <path
            d="M 450 50 Q 480 125 450 200"
            stroke={
              selectedElement === "concave-mirror" ? "#e74c3c" : "#87CEEB"
            }
            strokeWidth={selectedElement === "concave-mirror" ? "12" : "8"}
            fill="#B0E0E6"
            fillOpacity="0.7"
            onClick={() => handleElementClick("concave-mirror")}
            style={{ cursor: "pointer" }}
          />

          {/* Reflection lines */}
          <line
            x1="455"
            y1="60"
            x2="460"
            y2="55"
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1="455"
            y1="80"
            x2="460"
            y2="75"
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1="455"
            y1="100"
            x2="460"
            y2="95"
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1="455"
            y1="125"
            x2="460"
            y2="120"
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1="455"
            y1="150"
            x2="460"
            y2="155"
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1="455"
            y1="170"
            x2="460"
            y2="175"
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1="455"
            y1="190"
            x2="460"
            y2="195"
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  };

  if (loading || !questionData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "1.2rem",
        }}
      >
        {!questionData
          ? `Invalid Chest Number: ${chestNumber}`
          : `Loading Treasure Chest ${chestNumber}...`}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
        padding: "20px",
        fontFamily: "Inter, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/game/chapter1/level1")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          backdropFilter: "blur(10px)",
        }}
      >
        ← Back to Level
      </button>

      {/* Attempts Counter */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "6px",
            fontSize: "14px",
            backdropFilter: "blur(10px)",
          }}
        >
          Attempts: {attempts}
        </div>
        {isCompleted && (
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "rgba(34, 197, 94, 0.3)",
              color: "#fff",
              border: "1px solid rgba(34, 197, 94, 0.5)",
              borderRadius: "6px",
              fontSize: "14px",
              backdropFilter: "blur(10px)",
              fontWeight: "bold",
            }}
          >
            ✓ Completed
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          marginTop: "60px",
        }}
      >
        <h1
          style={{
            color: "#ffcc66",
            fontSize: "2rem",
            marginBottom: "10px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          🏴‍☠️ Treasure Chest {chestNumber}
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "1rem",
          }}
        >
          Study the diagram and identify the physics concepts!
        </p>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#b80f2c",
            fontSize: "1.5rem",
          }}
        >
          {questionData.question}
        </h3>

        {getChestContent()}

        <div
          style={{
            background: "#fff3cd",
            border: "2px solid #ffc107",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ color: "#856404" }}>
            Your Mission: {questionData.description}
          </h4>
        </div>

        {feedback && (
          <div
            style={{
              background: feedback.isCorrect ? "#d4edda" : "#f8d7da",
              border: `2px solid ${feedback.isCorrect ? "#28a745" : "#dc3545"}`,
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: feedback.isCorrect ? "#155724" : "#721c24",
                margin: 0,
                fontWeight: "bold",
              }}
            >
              {feedback.message}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/game/chapter1/level1")}
            style={{
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ← Back to Chests
          </button>
        </div>
      </div>
    </div>
  );
}
