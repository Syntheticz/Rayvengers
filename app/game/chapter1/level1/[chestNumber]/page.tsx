"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface Question {
  id: string;
  question: string;
  description: string;
  target: string;
  explanation: string;
}

const CHEST_QUESTIONS: Record<string, Question> = {
  "1": { 
    id: "chest1", 
    question: "Concave Mirror - Focal Point", 
    description: "Click on the focal point (F) in the diagram",
    target: "focal-point",
    explanation: "The focal point is where parallel light rays converge after reflecting from the concave mirror."
  },
  "2": { 
    id: "chest2", 
    question: "Concave Mirror - Center of Curvature", 
    description: "Click on the center of curvature (C) in the diagram",
    target: "center-curvature",
    explanation: "The center of curvature is the center of the sphere that the mirror is a part of."
  },
  "3": { 
    id: "chest3", 
    question: "Concave Mirror - Principal Axis", 
    description: "Click on the principal axis in the diagram",
    target: "principal-axis",
    explanation: "The principal axis is the line passing through the center of curvature and the vertex of the mirror."
  },
  "4": { 
    id: "chest4", 
    question: "Concave Mirror - Mirror Surface", 
    description: "Click on the concave mirror surface in the diagram",
    target: "concave-mirror",
    explanation: "The concave mirror surface is the curved reflective surface that converges light rays."
  }
};

export default function ChestQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const chestNumber = params.chestNumber as string;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const questionData = CHEST_QUESTIONS[chestNumber];

  useEffect(() => {
    if (!questionData) {
      router.push("/game/chapter1/level1");
      return;
    }

    const s = io("http://localhost:3000");
    setSocket(s);

    s.on("connect", () => {
      console.log(`Connected to server for chest ${chestNumber}`);
      const questionId = `chest${chestNumber}`;
      s.emit("claimQuestion", { questionId });
      setLoading(false); 
    });

    return () => {
      s.disconnect();
    };
  }, [chestNumber, questionData, router]);

  const handleElementClick = (elementType: string) => {
    setSelectedElement(elementType);
  };

  const handleSubmitAnswer = () => {
    if (!socket || !selectedElement) return;
    
    const questionId = `chest${chestNumber}`;
    socket.emit("submitAnswer", {
      questionId,
      answer: selectedElement
    });
    
    router.push("/game/chapter1/level1");
  };

  const getChestContent = () => {
    if (!questionData) return null;

    const baseStyle = {
      background: "#f8f9fa", 
      borderRadius: "12px", 
      padding: "20px",
      marginBottom: "20px"
    };

    const svgStyle = { 
      border: "2px solid #e0e0e0", 
      borderRadius: "8px", 
      background: "#fff" 
    };

    return (
      <div style={baseStyle}>
        <svg width="100%" height="300" viewBox="0 0 600 250" style={svgStyle}>
          {/* Principal Axis */}
          <line 
            x1="50" y1="125" x2="450" y2="125" 
            stroke={selectedElement === 'principal-axis' ? "#e74c3c" : "#000"}
            strokeWidth={selectedElement === 'principal-axis' ? "4" : "2"}
            onClick={() => handleElementClick('principal-axis')}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Center of Curvature */}
          <circle 
            cx="200" cy="125" r="6" 
            fill={selectedElement === 'center-curvature' ? "#e74c3c" : "#000"}
            onClick={() => handleElementClick('center-curvature')}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Focal Point */}
          <circle 
            cx="300" cy="125" r="6" 
            fill={selectedElement === 'focal-point' ? "#e74c3c" : "#000"}
            onClick={() => handleElementClick('focal-point')}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Concave Mirror */}
          <path 
            d="M 450 50 Q 480 125 450 200" 
            stroke={selectedElement === 'concave-mirror' ? "#e74c3c" : "#87CEEB"}
            strokeWidth={selectedElement === 'concave-mirror' ? "12" : "8"}
            fill="#B0E0E6"
            fillOpacity="0.7"
            onClick={() => handleElementClick('concave-mirror')}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Reflection lines */}
          <line x1="455" y1="60" x2="460" y2="55" stroke="#000" strokeWidth="1" />
          <line x1="455" y1="80" x2="460" y2="75" stroke="#000" strokeWidth="1" />
          <line x1="455" y1="100" x2="460" y2="95" stroke="#000" strokeWidth="1" />
          <line x1="455" y1="125" x2="460" y2="120" stroke="#000" strokeWidth="1" />
          <line x1="455" y1="150" x2="460" y2="155" stroke="#000" strokeWidth="1" />
          <line x1="455" y1="170" x2="460" y2="175" stroke="#000" strokeWidth="1" />
          <line x1="455" y1="190" x2="460" y2="195" stroke="#000" strokeWidth="1" />
        </svg>
      </div>
    );
  };

  if (loading || !questionData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "1.2rem"
      }}>
        {!questionData ? `Invalid Chest Number: ${chestNumber}` : `Loading Treasure Chest ${chestNumber}...`}
      </div>
    );
  }

  const isCorrectAnswer = questionData && selectedElement === questionData.target;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
      padding: "20px",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      <div style={{
        textAlign: "center",
        marginBottom: "30px"
      }}>
        <h1 style={{
          color: "#ffcc66",
          fontSize: "2rem",
          marginBottom: "10px",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
        }}>
          🏴‍☠️ Treasure Chest {chestNumber}
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.9)",
          fontSize: "1rem"
        }}>
          Study the diagram and identify the physics concepts!
        </p>
      </div>

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "16px",
        padding: "30px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
      }}>
        <h3 style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#b80f2c",
          fontSize: "1.5rem"
        }}>
          {questionData.question}
        </h3>
        
        {getChestContent()}

        <div style={{
          background: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px"
        }}>
          <h4 style={{ color: "#856404", marginBottom: "10px" }}>
            Your Mission: {questionData.description}
          </h4>
          <p style={{ color: "#856404", margin: 0 }}>
            {questionData.explanation}
          </p>
        </div>

        {selectedElement && (
          <div style={{
            background: isCorrectAnswer ? "#d4edda" : "#f8d7da",
            border: `2px solid ${isCorrectAnswer ? "#28a745" : "#dc3545"}`,
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px"
          }}>
            <p style={{ 
              color: isCorrectAnswer ? "#155724" : "#721c24",
              margin: 0,
              fontWeight: "bold"
            }}>
              {isCorrectAnswer 
                ? `🎉 Excellent! You found the ${questionData.target.replace('-', ' ')}!` 
                : `❌ You selected the ${selectedElement.replace('-', ' ')}. Try again!`}
            </p>
          </div>
        )}

        <div style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center"
        }}>
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
              fontSize: "1rem"
            }}
          >
            ← Back to Chests
          </button>
          
          {isCorrectAnswer && (
            <button
              onClick={handleSubmitAnswer}
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1rem",
                boxShadow: "0 4px 8px rgba(40,167,69,0.3)"
              }}
            >
              Submit Answer ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}