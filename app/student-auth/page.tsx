"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createUser } from "@/lib/queries";
import { User } from "@prisma/client";
import { signIn } from "next-auth/react";

export default function StudentAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    defaultValues: {
      name: "",
      age: 0,
      birthday: undefined,
      section: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: User) => {
    if (mode === "signup") {
      await createUser({ ...data, role: "Student" });
      alert("Success!");
      setMode("login");
    } else {
      signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: "/student/guide",
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#b80f2c",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
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
        }}
      >
        <h1
          style={{
            fontFamily: "Bangers, cursive",
            color: "#b80f2c",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "10px",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          {mode === "signup" ? "Student Sign Up" : "Student Login"}
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {mode === "signup" && (
            <>
              <label style={labelStyle}>Name</label>
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                style={inputStyle}
              />
              {errors.name && <span style={errorStyle}>Name is required</span>}

              <label style={labelStyle}>Age</label>
              <input
                type="number"
                min="1"
                {...register("age", { required: true, valueAsNumber: true })}
                placeholder="Age"
                style={inputStyle}
              />
              {errors.age && <span style={errorStyle}>Age is required</span>}

              <label style={labelStyle}>Birthday</label>
              <input
                type="date"
                {...register("birthday", { required: true, valueAsDate: true })}
                style={inputStyle}
              />
              {errors.birthday && (
                <span style={errorStyle}>Birthday is required</span>
              )}

              <label style={labelStyle}>Section</label>
              <select
                {...register("section", { required: true })}
                style={inputStyle}
              >
                <option value="">Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              {errors.section && (
                <span style={errorStyle}>Section is required</span>
              )}
            </>
          )}

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            {...register("email", { required: true })}
            placeholder="Email"
            style={inputStyle}
          />
          {errors.email && <span style={errorStyle}>Email is required</span>}

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            {...register("password", { required: true })}
            placeholder="Password"
            style={inputStyle}
          />
          {errors.password && (
            <span style={errorStyle}>Password is required</span>
          )}

          <button type="submit" style={buttonStyle}>
            {mode === "signup" ? "Sign Up" : "Log In"}
          </button>

          <div style={{ textAlign: "center", marginTop: 8 }}>
            {mode === "signup" ? (
              <span
                style={{
                  color: "#b80f2c",
                  cursor: "pointer",
                  fontSize: "0.70rem",
                }}
                onClick={() => setMode("login")}
              >
                Already have an account? Log in
              </span>
            ) : (
              <span
                style={{
                  color: "#b80f2c",
                  cursor: "pointer",
                  fontSize: "0.70rem",
                }}
                onClick={() => setMode("signup")}
              >
                Don&apos;t have an account? Sign up
              </span>
            )}
          </div>

          <button
            type="button"
            style={{
              ...buttonStyle,
              background: "#eee",
              color: "#b80f2c",
              marginTop: "0",
            }}
            onClick={() => router.push("/")}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  color: "#b80f2c",
  fontSize: "0.85rem",
  marginBottom: "3px",
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
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

const buttonStyle: React.CSSProperties = {
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

const errorStyle: React.CSSProperties = {
  color: "red",
  fontSize: "0.7rem",
  marginTop: "-5px",
};
