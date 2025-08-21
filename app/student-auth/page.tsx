"use client";
import React, { useState } from "react";

export default function StudentAuth() {
  const { push } = require('next/navigation').useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [form, setForm] = useState({
    name: "",
    age: "",
    birthday: "",
    section: "",
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${mode === "signup" ? "Signed up" : "Logged in"} as student!`);
  };
  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#b80f2c", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        padding: "18px 12px 16px 12px",
        minWidth: "220px",
        maxWidth: "320px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <h1 style={{
          fontFamily: "Bangers, cursive",
          color: "#b80f2c",
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "10px",
          letterSpacing: "1px",
          textAlign: "center",
        }}>{mode === "signup" ? "Student Sign Up" : "Student Login"}</h1>
        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
          {mode === "signup" && (
            <>
              <label style={labelStyle}>Name</label>
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={inputStyle} />
              <label style={labelStyle}>Age</label>
              <input name="age" placeholder="Age" value={form.age} onChange={handleChange} required style={inputStyle} type="number" min="1" />
              <label style={labelStyle}>Birthday</label>
              <input name="birthday" placeholder="Birthday" value={form.birthday} onChange={handleChange} required style={inputStyle} type="date" />
              <label style={labelStyle}>Section</label>
              <select name="section" value={form.section} onChange={handleChange} required style={inputStyle}>
                <option value="">Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </>
          )}
          <label style={labelStyle}>Email</label>
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} type="email" />
          <label style={labelStyle}>Password</label>
          <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} type="password" />
          <button type="submit" style={buttonStyle}>{mode === "signup" ? "Sign Up" : "Log In"}</button>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            {mode === "signup" ? (
              <span style={{ color: "#b80f2c", cursor: "pointer", fontSize: "0.70rem" }} onClick={() => setMode("login")}>Already have an account? Log in</span>
            ) : (
              <span style={{ color: "#b80f2c", cursor: "pointer", fontSize: "0.70rem" }} onClick={() => setMode("signup")}>Don't have an account? Sign up</span>
            )}
          </div>
          <button type="button" style={{ ...buttonStyle, background: "#eee", color: "#b80f2c", marginTop: "0" }} onClick={() => push("/")}>Back</button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontFamily: "'Press Start 2P', cursive",
  color: "#b80f2c",
  fontSize: "0.85rem",
  marginBottom: "3px",
  textAlign: "left",
};
const inputStyle = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "0.95rem",
  padding: "7px 10px",
  borderRadius: "6px",
  border: "1.2px solid #b80f2c",
  marginBottom: "1px",
  outline: "none",
  background: "#f8f8f8",
  color: "#8a0c1c",
  boxSizing: "border-box",
};
const buttonStyle = {
  fontFamily: "Bangers, cursive",
  fontSize: "1rem",
  background: "#b80f2c",
  color: "#ffcc66",
  border: "none",
  borderRadius: "6px",
  padding: "10px 0",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "6px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  letterSpacing: "1px",
  transition: "background 0.2s",
};
