"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export default function ChestQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chestNumber = params.chestNumber as string;
  const sessionId = searchParams.get('session');
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/student/lobby');
      return;
    }

    const s = io("http://localhost:3000");
    setSocket(s);

    s.on("connect", () => {
      console.log(`[chest${chestNumber}] Connected to server`);
      // Request question data for this specific chest
      s.emit("getChestQuestion", { sessionId, chestNumber });
    });

    s.on("chestQuestion", (data) => {
      console.log(`[chest${chestNumber}] Received question:`, data);
      setQuestionData(data);
      setLoading(false);
    });

    return () => {
      s.disconnect();
    };
  }, [sessionId, chestNumber, router]);

  const handleElementClick = (elementType: string) => {
    setSelectedElement(elementType);
  };

  const handleSubmitAnswer = () => {
    if (!socket || !sessionId || !selectedElement) return;
    
    // Submit the selected element as the answer
    socket.emit("submitChestAnswer", {
      sessionId,
      chestNumber,
      answer: selectedElement
    });
    
    // Go back to level view
    router.push(`/game/chapter1/level1?session=${sessionId}`);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Press Start 2P', cursive"
      }}>
        Loading Treasure Chest {chestNumber}...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #b80f2c 0%, #8b0a1f 100%)",
      padding: "20px",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: "30px"
      }}>
        <h1 style={{
          fontFamily: "Bangers, cursive",
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

      {/* Interactive Physics Diagram */}
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
          fontSize: "1.5rem",
          fontFamily: "'Press Start 2P', cursive"
        }}>
          Concave Mirror Ray Diagram
        </h3>
        
        <div style={{ 
          background: "#f8f9fa", 
          borderRadius: "12px", 
          padding: "20px",
          marginBottom: "20px"
        }}>
          <svg width="100%" height="250" viewBox="0 0 500 200" style={{ border: "2px solid #e0e0e0", borderRadius: "8px", background: "#fff" }}>
            {/* Principal Axis */}
            <line 
              x1="50" y1="100" x2="450" y2="100" 
              stroke="#333" 
              strokeWidth="3"
              onClick={() => handleElementClick('principal-axis')}
              style={{ cursor: 'pointer' }}
            />
            <text x="460" y="105" fontSize="12" fill="#333">Principal Axis</text>
            
            {/* Center of Curvature (C) */}
            <circle 
              cx="250" cy="100" r="6" 
              fill={selectedElement === 'center-curvature' ? "#e74c3c" : "#3498db"}
              stroke="#fff"
              strokeWidth="2"
              onClick={() => handleElementClick('center-curvature')}
              style={{ cursor: 'pointer' }}
            />
            <text x="250" y="125" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#3498db">C</text>
            
            {/* Focal Point (F) */}
            <circle 
              cx="325" cy="100" r="6" 
              fill={selectedElement === 'focal-point' ? "#e74c3c" : "#f39c12"}
              stroke="#fff"
              strokeWidth="2"
              onClick={() => handleElementClick('focal-point')}
              style={{ cursor: 'pointer' }}
            />
            <text x="325" y="125" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#f39c12">F</text>
            
            {/* Concave Mirror */}
            <path 
              d="M 400 30 Q 430 100 400 170" 
              stroke={selectedElement === 'concave-mirror' ? "#e74c3c" : "#87ceeb"}
              strokeWidth="12" 
              fill="none"
              onClick={() => handleElementClick('concave-mirror')}
              style={{ cursor: 'pointer' }}
            />
            
            {/* Object (Arrow) */}
            <line x1="150" y1="100" x2="150" y2="60" stroke="#e74c3c" strokeWidth="4" />
            <polygon points="145,60 150,50 155,60" fill="#e74c3c" />
            <text x="150" y="45" textAnchor="middle" fontSize="12" fill="#e74c3c" fontWeight="bold">Object</text>
            
            {/* Sample Light Rays */}
            <line x1="150" y1="60" x2="400" y2="60" stroke="#27ae60" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
            <line x1="150" y1="60" x2="325" y2="100" stroke="#27ae60" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
            <line x1="325" y1="100" x2="400" y2="140" stroke="#27ae60" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
            
            {/* Reflected Rays */}
            <line x1="400" y1="60" x2="250" y2="100" stroke="#9b59b6" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
            <line x1="400" y1="140" x2="250" y2="100" stroke="#9b59b6" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
            
            {/* Image (behind mirror) */}
            <line x1="280" y1="100" x2="280" y2="120" stroke="#e67e22" strokeWidth="3" strokeDasharray="2,2" opacity="0.8" />
            <polygon points="275,120 280,125 285,120" fill="#e67e22" opacity="0.8" />
            <text x="280" y="140" textAnchor="middle" fontSize="10" fill="#e67e22">Image</text>
          </svg>
        </div>

        {/* Question */}
        <div style={{
          background: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px"
        }}>
          <h4 style={{ color: "#856404", marginBottom: "10px" }}>
            📝 Your Mission: Click on the FOCAL POINT in the diagram above
          </h4>
          <p style={{ color: "#856404", margin: 0 }}>
            The focal point (F) is where parallel light rays converge after reflecting from the concave mirror.
          </p>
        </div>

        {/* Feedback */}
        {selectedElement && (
          <div style={{
            background: selectedElement === 'focal-point' ? "#d4edda" : "#f8d7da",
            border: `2px solid ${selectedElement === 'focal-point' ? "#28a745" : "#dc3545"}`,
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px"
          }}>
            <p style={{ 
              color: selectedElement === 'focal-point' ? "#155724" : "#721c24",
              margin: 0,
              fontWeight: "bold"
            }}>
              {selectedElement === 'focal-point' 
                ? "🎉 Excellent! You found the focal point!" 
                : `❌ You selected the ${selectedElement.replace('-', ' ')}. Try again!`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center"
        }}>
          <button
            onClick={() => router.push(`/game/chapter1/level1?session=${sessionId}`)}
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
          
          {selectedElement === 'focal-point' && (
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
