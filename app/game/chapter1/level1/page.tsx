"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

interface Question {
  id: string;
  question: string;
  options: string[];
  text: string;
  correctAnswer: number;
}

interface QuestionState {
  id: string;
  status: "available" | "claimed" | "completed";
  claimedBy?: string;
  claimedByName?: string;
  answer?: number;
  isCorrect?: boolean;
  completedAt?: Date;
}

export default function Chapter1Level1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStates, setQuestionStates] = useState<
    Record<string, QuestionState>
  >({});
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push("/student/lobby");
      return;
    }

    const s = io("http://localhost:3000");
    setSocket(s);

    s.on("connect", () => {
      console.log("[game] Connected to game server");
      s.emit("getQuestions", { sessionId });
    });

    s.on(
      "questionsUpdate",
      (data: {
        questions: Question[];
        questionStates: Record<string, QuestionState>;
      }) => {
        console.log("[game] Questions updated:", data);
        setQuestions(data.questions);
        setQuestionStates(data.questionStates);
        setLoading(false);
      }
    );

    s.on("answerResult", (data: { questionId: string; isCorrect: boolean }) => {
      console.log("[game] Answer result:", data);
      alert(`${data.isCorrect ? "🎉 Correct!" : "❌ Wrong!"}`);
      setSelectedQuestion(null);
      setSelectedAnswer(null);
    });

    s.on("gameCompleted", (data) => {
      console.log("[game] Game completed:", data);
      alert("🎉 All treasure chests opened! Well done adventurers!");
      router.push("/student/lobby");
    });

    s.on("claimError", (error) => {
      alert(error.message);
    });

    s.on("submitError", (error) => {
      alert(error.message);
    });

    return () => {
      s.disconnect();
    };
  }, [sessionId, router]);

  const handleBackToLobby = () => {
    router.push("/student/lobby");
  };

  const handleClaimQuestion = (question: Question) => {
    if (!socket || !sessionId) return;

    const state = questionStates[question.id];
    if (state?.status !== "available") return;

    socket.emit("claimQuestion", { sessionId, questionId: question.id });
    setSelectedQuestion(question);
  };

  const handleSubmitAnswer = () => {
    if (!socket || !sessionId || !selectedQuestion || selectedAnswer === null)
      return;

    socket.emit("submitAnswer", {
      sessionId,
      questionId: selectedQuestion.id,
      answer: selectedAnswer,
    });
  };

  const getQuestionStatusColor = (state: QuestionState | undefined) => {
    if (!state) return "#8b5cf6"; // available - purple
    switch (state.status) {
      case "available":
        return "#8b5cf6";
      case "claimed":
        return "#f59e0b";
      case "completed":
        return state.isCorrect ? "#22c55e" : "#ef4444";
      default:
        return "#8b5cf6";
    }
  };

  const getQuestionStatusText = (state: QuestionState | undefined) => {
    if (!state) return "Ready to Open";
    switch (state.status) {
      case "available":
        return "Ready to Open";
      case "claimed":
        return `Opened by ${state.claimedByName}`;
      case "completed":
        return `${state.isCorrect ? "Treasure Found!" : "Empty Chest"} by ${
          state.claimedByName
        }`;
      default:
        return "Ready to Open";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffcc66",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,204,102,0.3)",
              borderTop: "4px solid #ffcc66",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <div
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "14px",
            }}
          >
            Loading Treasure Chests...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
        padding: "16px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Back button */}
      <button
        onClick={handleBackToLobby}
        style={{
          background: "#ffcc66",
          border: "none",
          color: "#b80f2c",
          padding: "12px 20px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          fontFamily: "Bangers, cursive",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          marginBottom: "20px",
        }}
      >
        ← Back to Lobby
      </button>

      {/* Title */}
      <h1
        style={{
          color: "#ffcc66",
          fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "'Press Start 2P', cursive",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          marginBottom: "30px",
        }}
      >
        Level 1 – The Light Seeker
      </h1>

      {!selectedQuestion ? (
        /* Treasure Chest Selection View */
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              color: "#fff",
              textAlign: "center",
              marginBottom: "30px",
              fontSize: "clamp(1rem, 4vw, 1.5rem)",
              fontFamily: "'Press Start 2P', cursive",
            }}
          >
            Choose Your Treasure Chest
          </h2>

          <div
            style={{
              display: "grid",
              gap: "20px",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              justifyItems: "center",
            }}
          >
            {questions.map((question, index) => {
              const state = questionStates[question.id];
              const isAvailable = !state || state.status === "available";
              const isClaimed = state?.status === "claimed";
              const isCompleted = state?.status === "completed";

              return (
                <div
                  key={question.id}
                  onClick={() => isAvailable && handleClaimQuestion(question)}
                  style={{
                    cursor: isAvailable ? "pointer" : "not-allowed",
                    textAlign: "center",
                    transform: isAvailable ? "scale(1)" : "scale(0.9)",
                    opacity: isAvailable ? 1 : 0.7,
                    transition: "all 0.3s ease",
                    filter: isAvailable ? "none" : "grayscale(50%)",
                  }}
                >
                  {/* Treasure Chest */}
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      margin: "0 auto 16px",
                      position: "relative",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                    }}
                  >
                    <Image
                      src="/chest.png"
                      alt="Treasure Chest"
                      width={120}
                      height={120}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: isCompleted
                          ? state?.isCorrect
                            ? "hue-rotate(120deg) saturate(1.2)"
                            : "hue-rotate(0deg) saturate(1.5)"
                          : isClaimed
                          ? "hue-rotate(45deg) saturate(1.1)"
                          : isAvailable
                          ? "none"
                          : "grayscale(70%) opacity(0.6)",
                        transition: "all 0.3s ease",
                      }}
                      priority
                    />

                    {/* Status Overlay */}
                    {isCompleted && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "24px",
                          height: "24px",
                          background: state?.isCorrect ? "#22c55e" : "#ef4444",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          border: "2px solid white",
                        }}
                      >
                        <span
                          style={{
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          {state?.isCorrect ? "✓" : "✗"}
                        </span>
                      </div>
                    )}

                    {/* Claimed Indicator */}
                    {isClaimed && !isCompleted && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "20px",
                          height: "20px",
                          background: "#f59e0b",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          border: "2px solid white",
                        }}
                      >
                        <span
                          style={{
                            color: "white",
                            fontSize: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          ⏳
                        </span>
                      </div>
                    )}

                    {/* Magical Glow Effect for Available Chests */}
                    {isAvailable && (
                      <div
                        style={{
                          position: "absolute",
                          inset: "-10px",
                          background:
                            "radial-gradient(circle, rgba(255,204,102,0.3) 0%, transparent 70%)",
                          borderRadius: "50%",
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}

                    {/* Sparkles for Completed Chests */}
                    {isCompleted && (
                      <div
                        style={{
                          position: "absolute",
                          inset: "-5px",
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "10%",
                            right: "10%",
                            width: "8px",
                            height: "8px",
                            background: "#fbbf24",
                            borderRadius: "50%",
                            animation: "sparkle 1.5s infinite",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "20%",
                            left: "15%",
                            width: "6px",
                            height: "6px",
                            background: "#f59e0b",
                            borderRadius: "50%",
                            animation: "sparkle 1.5s infinite 0.3s",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Chest Label */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      border: `2px solid ${getQuestionStatusColor(state)}`,
                    }}
                  >
                    <div
                      style={{
                        color: "#b80f2c",
                        fontSize: "14px",
                        fontWeight: "bold",
                        fontFamily: "'Press Start 2P', cursive",
                        marginBottom: "4px",
                      }}
                    >
                      Chest {index + 1}
                    </div>

                    <div
                      style={{
                        color: "#666",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {getQuestionStatusText(state)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px",
              maxWidth: "500px",
              margin: "40px auto 0",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>Choose a treasure chest to reveal your question!</strong>
            </p>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Once claimed, other students can&apos;t pick the same chest.
              Answer correctly to unlock the treasure!
            </p>
          </div>
        </div>
      ) : (
        /* Question Answering View */
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                📜
              </div>
              <h3
                style={{
                  color: "#b80f2c",
                  fontSize: "18px",
                  margin: 0,
                  fontFamily: "'Press Start 2P', cursive",
                }}
              >
                Ancient Riddle
              </h3>
            </div>

            <p
              style={{
                color: "#333",
                fontSize: "16px",
                lineHeight: "1.5",
                textAlign: "center",
                marginBottom: "24px",
                fontStyle: "italic",
              }}
            >
              {selectedQuestion.text}
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              {selectedQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  style={{
                    background:
                      selectedAnswer === index ? "#ffcc66" : "#f5f5f5",
                    border: `2px solid ${
                      selectedAnswer === index ? "#b80f2c" : "#ddd"
                    }`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    fontWeight: selectedAnswer === index ? "bold" : "normal",
                  }}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setSelectedAnswer(null);
                }}
                style={{
                  background: "#666",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Back to Chests
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                style={{
                  background: selectedAnswer !== null ? "#b80f2c" : "#ccc",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: selectedAnswer !== null ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                }}
              >
                Open Chest! 🗝️
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
