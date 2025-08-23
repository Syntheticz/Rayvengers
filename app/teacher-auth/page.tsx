"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

type TeacherFormValues = {
  email: string;
  password: string;
};

export default function TeacherAuth() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: TeacherFormValues) => {
    signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/teacher/dashboard",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#a50021",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          padding: "48px 56px 40px 56px",
          minWidth: "400px",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Bangers, cursive",
            color: "#b80f2c",
            fontSize: "2.8rem",
            fontWeight: "bold",
            marginBottom: "18px",
            letterSpacing: "2px",
            textAlign: "center",
          }}
        >
          Teacher Login
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          <label
            style={{
              fontFamily: "'Press Start 2P', cursive",
              color: "#b80f2c",
              fontSize: "1.1rem",
              marginBottom: "6px",
              textAlign: "left",
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Za-z0-9._%+-]+@deped\.gov\.ph$/,
                message:
                  "Only DepEd emails are allowed (e.g., name@deped.gov.ph)",
              },
            })}
            style={inputStyle}
          />
          {errors.email && (
            <span style={errorStyle}>{errors.email.message}</span>
          )}

          <label
            style={{
              fontFamily: "'Press Start 2P', cursive",
              color: "#b80f2c",
              fontSize: "1.1rem",
              marginBottom: "6px",
              textAlign: "left",
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            style={inputStyle}
          />
          {errors.password && (
            <span style={errorStyle}>{errors.password.message}</span>
          )}

          <button type="submit" style={buttonStyle}>
            Log In
          </button>

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

const inputStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: "1.15rem",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "2px solid #b80f2c",
  marginBottom: "2px",
  outline: "none",
  background: "#f8f8f8",
  color: "#8a0c1c",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
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

const errorStyle: React.CSSProperties = {
  color: "red",
  fontSize: "0.8rem",
  marginTop: "-8px",
};
