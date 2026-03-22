"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PersonaRow {
  id: string;
  name: string;
  niche: string;
  gender: string;
  style: string;
  consistency_seed: string | null;
  created_at: string;
}

interface ApiSuccess {
  success: true;
  persona: PersonaRow;
}

interface ApiError {
  error: string;
  message: string;
}

type ApiResult = ApiSuccess | ApiError;

const NICHES = [
  { value: "fitness", label: "Fitness" },
  { value: "fashion", label: "Fashion" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "business", label: "Business" },
] as const;

const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
] as const;

const STYLES = [
  { value: "influencer", label: "Influencer" },
  { value: "luxury", label: "Luxury" },
  { value: "casual", label: "Casual" },
  { value: "gym", label: "Gym" },
] as const;

export default function CreatePersonaPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [gender, setGender] = useState("");
  const [style, setStyle] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 &&
    niche !== "" &&
    gender !== "" &&
    style !== "" &&
    !loading;

  async function handleCreate() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          niche,
          gender,
          style,
        }),
      });

      const data = (await res.json()) as ApiResult;

      if (!res.ok || !("success" in data)) {
        const msg =
          "message" in data ? data.message : "Failed to create persona";
        setError(msg);
        return;
      }

      router.push("/studio");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: 28,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Create Persona
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          Define your AI influencer identity
        </p>

        {/* NAME */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>
            Persona Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Luna Voss"
            maxLength={60}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
            }}
          />
        </div>

        {/* NICHE */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>Niche</label>

          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <option value="">Select niche</option>
            {NICHES.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* GENDER */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>Gender</label>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* STYLE */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>Style</label>

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <option value="">Select style</option>
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 12,
              padding: 10,
              marginBottom: 16,
              color: "#f87171",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            background: canSubmit
              ? "linear-gradient(135deg,#a855f7,#ec4899)"
              : "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Creating..." : "Create Persona"}
        </button>
      </div>
    </div>
  );
}
