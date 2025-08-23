"use client";
import React, { useState } from "react";

export default function TeacherAuth() {
  const { push } = require('next/navigation').useRouter();
  const [form, setForm] = useState({
    email: "teacher@example.com",
    password: "password123",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Logged in as teacher!");
    push("/teacher/dashboard");
  };
  return (
    <div style={{ minHeight: "100vh", background: "#a50021", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        background: "#fff",
        borderRadius: "32px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
        padding: "48px 56px 40px 56px",
        minWidth: "400px",
        maxWidth: "440px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <h1 style={{
          fontFamily: "Bangers, cursive",
          color: "#b80f2c",
          fontSize: "2.8rem",
          fontWeight: "bold",
          marginBottom: "18px",
          letterSpacing: "2px",
          textAlign: "center",
        }}>Teacher Login</h1>
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "22px" }}>
          <label style={{ fontFamily: "'Press Start 2P', cursive", color: "#b80f2c", fontSize: "1.1rem", marginBottom: "6px", textAlign: "left" }}>Email</label>
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} type="email" />
          <label style={{ fontFamily: "'Press Start 2P', cursive", color: "#b80f2c", fontSize: "1.1rem", marginBottom: "6px", textAlign: "left" }}>Password</label>
          <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} type="password" />
          <button type="submit" style={buttonStyle}>Log In</button>
          <button type="button" style={{ ...buttonStyle, background: "#eee", color: "#b80f2c", marginTop: "0" }} onClick={() => push("/")}>Back</button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "1.15rem",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "2px solid #b80f2c",
  marginBottom: "2px",
  outline: "none",
  background: "#f8f8f8",
  color: "#8a0c1c",
  boxSizing: 'border-box' as const,
};
const buttonStyle = {
  fontFamily: "Bangers, cursive",
  fontSize: "1.35rem",
  background: "#b80f2c",
  color: "#ffcc66",
  border: "none",
  borderRadius: "10px",
  padding: "16px 0",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  letterSpacing: "2px",
  transition: "background 0.2s",
};
