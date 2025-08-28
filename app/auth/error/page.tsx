"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const errorType = searchParams.get("error");
    switch (errorType) {
      case "CredentialsSignin":
        setError("Invalid email or password. Please try again.");
        break;
      case "Configuration":
        setError("There is a configuration error. Please contact support.");
        break;
      default:
        setError("An authentication error occurred. Please try again.");
    }
  }, [searchParams]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "32px",
      background: "#f8f8f8" 
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        padding: "32px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{
          fontFamily: "Bangers, cursive",
          color: "#b80f2c",
          fontSize: "2rem",
          marginBottom: "16px"
        }}>
          Authentication Error
        </h1>
        <p style={{
          fontFamily: "'Press Start 2P', cursive",
          color: "#333",
          fontSize: "0.9rem",
          lineHeight: "1.6",
          marginBottom: "24px"
        }}>
          {error}
        </p>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "#b80f2c",
            color: "#ffcc66",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontWeight: 700,
            fontFamily: "Bangers, cursive",
            fontSize: "1.1rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
