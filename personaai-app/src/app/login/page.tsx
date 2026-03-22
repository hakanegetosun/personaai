"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("Debug output will appear here.");

  const login = async () => {
    try {
      setLoading(true);
      setDebug("Login button clicked...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setDebug(`SUPABASE ERROR: ${error.message}`);
        return;
      }

      setDebug(`LOGIN OK: ${JSON.stringify({ userId: data.user?.id ?? null })}`);
      window.location.href = "/studio";
    } catch (err) {
      const message =
        err instanceof Error ? `${err.name}: ${err.message}` : "Unknown login failure";
      setDebug(`FATAL: ${message}`);
      console.error("LOGIN_FATAL", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0f",
        color: "white",
        padding: 24,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 24,
          borderRadius: 20,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          PersonaAI Login
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.05)",
            color: "white",
            outline: "none",
          }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: 14,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.05)",
            color: "white",
            outline: "none",
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          type="button"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "none",
            background:
              "linear-gradient(135deg,rgba(168,85,247,.92),rgba(236,72,153,.82))",
            color: "white",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginBottom: 12,
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(255,255,255,.8)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 12,
            padding: 12,
            minHeight: 72,
          }}
        >
          {debug}
        </div>
      </div>
    </div>
  );
}
