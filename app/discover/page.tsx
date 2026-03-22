"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import TabBar from "@/components/TabBar";

type Persona = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  badge: string;
  tags: string[];
  chips: string[];
  glowA: string;
  glowB: string;
  bg: string;
};

const PERSONAS: Persona[] = [
  {
    id: 1,
    name: "Siena Stone",
    handle: "@siena.stone",
    initials: "SS",
    badge: "94%",
    tags: ["Fitness", "Viral"],
    chips: ["High eng...", "Strong b...", "Viral-re..."],
    glowA: "rgba(168,85,247,.55)",
    glowB: "rgba(236,72,153,.35)",
    bg: "linear-gradient(160deg,#1a0a2e 0%,#2d1060 45%,#0f0820 100%)",
  },
  {
    id: 2,
    name: "Luna Vale",
    handle: "@luna.vale",
    initials: "LV",
    badge: "87%",
    tags: ["Lifestyle", "Fashion"],
    chips: ["Aesthetic...", "Premium...", "Top-tier..."],
    glowA: "rgba(99,102,241,.55)",
    glowB: "rgba(59,130,246,.35)",
    bg: "linear-gradient(160deg,#0a1a2e 0%,#103060 45%,#08152e 100%)",
  },
  {
    id: 3,
    name: "Mira Kline",
    handle: "@mira.kline",
    initials: "MK",
    badge: "91%",
    tags: ["Model", "Beauty"],
    chips: ["Luxury...", "Brand-fit...", "Niche-au..."],
    glowA: "rgba(236,72,153,.55)",
    glowB: "rgba(168,85,247,.35)",
    bg: "linear-gradient(160deg,#1a0a18 0%,#601040 45%,#200a18 100%)",
  },
];

function StatChip({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "5px 11px",
        borderRadius: 999,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.10)",
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(255,255,255,.68)",
        letterSpacing: 0.2,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {label}
    </div>
  );
}

function TagPill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "5px 12px",
        borderRadius: 999,
        background: accent
          ? "linear-gradient(135deg,rgba(168,85,247,.30),rgba(236,72,153,.22))"
          : "rgba(255,255,255,.07)",
        border: accent
          ? "1px solid rgba(168,85,247,.35)"
          : "1px solid rgba(255,255,255,.10)",
        fontSize: 11,
        fontWeight: 700,
        color: accent ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.72)",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </div>
  );
}

function FeatureChip({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: "rgba(0,0,0,.35)",
        border: "1px solid rgba(255,255,255,.10)",
        fontSize: 10,
        fontWeight: 600,
        color: "rgba(255,255,255,.62)",
        letterSpacing: 0.1,
      }}
    >
      {label}
    </div>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        background: persona.bg,
        border: "1px solid rgba(255,255,255,.10)",
        boxShadow:
          "0 0 0 1px rgba(168,85,247,.12), 0 28px 70px rgba(0,0,0,.70), 0 0 100px rgba(168,85,247,.25), inset 0 1px 0 rgba(255,255,255,.08)",
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "20px 20px 24px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: persona.glowA,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: persona.glowB,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-70%)",
          width: 130,
          height: 130,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg,rgba(168,85,247,.30),rgba(236,72,153,.22))",
          border: "1.5px solid rgba(255,255,255,.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          fontWeight: 900,
          color: "rgba(255,255,255,.88)",
          letterSpacing: 1,
          boxShadow:
            "0 20px 60px rgba(0,0,0,.5),0 0 50px rgba(168,85,247,.30)",
        }}
      >
        {persona.initials}
      </div>

      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 10px",
          borderRadius: 999,
          background: "rgba(0,0,0,.45)",
          border: "1px solid rgba(255,255,255,.12)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,255,255,.85)",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#a855f7,#ec4899)",
            boxShadow: "0 0 6px rgba(168,85,247,.8)",
          }}
        />
        {persona.badge}
      </div>

      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          fontSize: 11,
          color: "rgba(255,255,255,.42)",
          fontWeight: 500,
          letterSpacing: 0.3,
        }}
      >
        {persona.handle}
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 0.2,
            color: "rgba(255,255,255,.96)",
            marginBottom: 10,
            lineHeight: 1.1,
          }}
        >
          {persona.name}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {persona.tags.map((t, i) => (
            <TagPill key={t} label={t} accent={i === 0} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {persona.chips.map((c) => (
            <FeatureChip key={c} label={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

type ActionVariant = "reject" | "select" | "save";

function ActionButton({
  onClick,
  children,
  variant,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant: ActionVariant;
}) {
  const variantStyles: Record<ActionVariant, React.CSSProperties> = {
    reject: {
      width: 58,
      height: 58,
      borderRadius: 20,
      background: "rgba(239,68,68,.12)",
      border: "1px solid rgba(239,68,68,.30)",
      color: "rgba(239,68,68,.90)",
      boxShadow:
        "0 0 0 1px rgba(239,68,68,.08),0 12px 30px rgba(239,68,68,.15)",
    },
    select: {
      width: 72,
      height: 72,
      borderRadius: 24,
      background:
        "linear-gradient(135deg,rgba(168,85,247,.85),rgba(236,72,153,.75))",
      border: "1px solid rgba(168,85,247,.40)",
      color: "rgba(255,255,255,.96)",
      boxShadow:
        "0 0 0 1px rgba(168,85,247,.15),0 18px 45px rgba(168,85,247,.40),0 0 60px rgba(168,85,247,.25)",
    },
    save: {
      width: 58,
      height: 58,
      borderRadius: 20,
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.12)",
      color: "rgba(255,255,255,.70)",
      boxShadow:
        "0 0 0 1px rgba(255,255,255,.04),0 12px 30px rgba(0,0,0,.3)",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        ...variantStyles[variant],
      }}
    >
      {children}
    </button>
  );
}

export default function DiscoverPage() {
  const [index, setIndex] = useState(0);
  const [swipes, setSwipes] = useState(4);

  const persona = PERSONAS[index % PERSONAS.length];

  const advance = () => {
    setIndex((i) => i + 1);
    setSwipes((s) => s + 1);
  };

  const handleRefresh = () => {
    setIndex(0);
    setSwipes(0);
  };

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 18px 12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,.96)",
                lineHeight: 1,
              }}
            >
              DISCOVER
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                color: "rgba(255,255,255,.44)",
                letterSpacing: 0.2,
              }}
            >
              Your exclusive AI models
            </div>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
              <StatChip label="model 39%" />
              <StatChip label="fitness 25%" />
              <StatChip label="lifestyle 25%" />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg,rgba(168,85,247,.22),rgba(236,72,153,.14))",
              border: "1px solid rgba(168,85,247,.32)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow:
                "0 0 22px rgba(168,85,247,.20),inset 0 1px 0 rgba(255,255,255,.08)",
              fontSize: 13,
              fontWeight: 800,
              color: "rgba(255,255,255,.92)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14 }}>⭐</span>
            <span>12</span>
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: 20 }}>
          <div
            style={{
              position: "absolute",
              bottom: -14,
              left: "6%",
              right: "6%",
              height: "100%",
              borderRadius: 28,
              background: "rgba(168,85,247,.05)",
              border: "1px solid rgba(255,255,255,.04)",
              transform: "scaleX(.92)",
              transformOrigin: "bottom",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <PersonaCard persona={persona} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            marginBottom: 18,
          }}
        >
          <ActionButton variant="reject" onClick={advance}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ActionButton>

          <ActionButton variant="select" onClick={advance}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </ActionButton>

          <ActionButton variant="save" onClick={advance}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </ActionButton>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.35)",
              fontWeight: 500,
            }}
          >
            {swipes} swipes today
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              padding: 0,
              backgroundImage: "linear-gradient(135deg,#a855f7,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "inherit",
            }}
          >
            Refresh ↻
          </button>
        </div>
      </div>

      <TabBar />
    </AppShell>
  );
}
