"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";

type ReferenceItem = {
  id: number;
  title: string;
  vibe: string;
  gradient?: string;
  imageUrl?: string;
};

type RecommendedControls = {
  look: string;
  motion: string;
  strategy: string;
  priorities: string[];
};

type Persona = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  badge: string;
  coverImageUrl?: string;
  tags: string[];
  chips: string[];
  glowA: string;
  glowB: string;
  bg: string;
  bio: string;
  bestFor: string[];
  category: string;
  niche: string;
  recommended: RecommendedControls;
  references: ReferenceItem[];
};

type SwipeDir = "left" | "right" | null;

const ACTIVE_PERSONA_KEY = "active_persona";

const PERSONAS: Persona[] = [
  {
    id: 1,
    name: "Siena Stone",
    handle: "@siena.stone",
    initials: "SS",
    badge: "94%",
    tags: ["Fitness", "Viral"],
    chips: ["High eng.", "Strong brand", "Viral-ready"],
    glowA: "rgba(168,85,247,.60)",
    glowB: "rgba(236,72,153,.40)",
    bg: "linear-gradient(170deg,#1a0a2e 0%,#2d1060 40%,#180830 75%,#0f0820 100%)",
    bio: "High-energy fitness creator with strong short-form potential. Great for gym reels, routine content, wellness hooks, and bold creator-style performance posts.",
    bestFor: [
      "Gym routine reels",
      "Meal prep content",
      "Morning wellness stories",
      "High-hook short form",
    ],
    category: "Fitness",
    niche: "Wellness / Performance",
    recommended: {
      look: "Luxury Realism",
      motion: "Fast Hooky",
      strategy: "Viral Reach",
      priorities: ["Face Consistency", "Realism", "Hook Strength"],
    },
    references: [
      {
        id: 11,
        title: "Gym mirror check",
        vibe: "strong hook",
        gradient: "linear-gradient(160deg,#1b1030,#522082,#1a0b2a)",
      },
      {
        id: 12,
        title: "Breakfast counter",
        vibe: "healthy lifestyle",
        gradient: "linear-gradient(160deg,#24112d,#7a265b,#241028)",
      },
      {
        id: 13,
        title: "Pilates studio",
        vibe: "clean fitness",
        gradient: "linear-gradient(160deg,#171833,#3244a0,#121429)",
      },
      {
        id: 14,
        title: "Outdoor run prep",
        vibe: "natural movement",
        gradient: "linear-gradient(160deg,#102128,#1f6d5c,#0b1818)",
      },
      {
        id: 15,
        title: "Post-workout selfie",
        vibe: "phone native",
        gradient: "linear-gradient(160deg,#2a1323,#7c2454,#1a0b17)",
      },
    ],
  },
  {
    id: 2,
    name: "Luna Vale",
    handle: "@luna.vale",
    initials: "LV",
    badge: "87%",
    tags: ["Lifestyle", "Fashion"],
    chips: ["Aesthetic", "Premium", "Top-tier"],
    glowA: "rgba(99,102,241,.60)",
    glowB: "rgba(59,130,246,.40)",
    bg: "linear-gradient(170deg,#0a1a2e 0%,#103060 40%,#0c1e40 75%,#08152e 100%)",
    bio: "Premium lifestyle and fashion persona designed for polished but believable content. Strong fit for city looks, daily outfit updates, and aspirational creator-style posting.",
    bestFor: ["OOTD content", "Cafe lifestyle posts", "Travel fit checks", "Soft premium reels"],
    category: "Lifestyle",
    niche: "Fashion / City Aesthetic",
    recommended: {
      look: "Clean Editorial",
      motion: "Balanced",
      strategy: "Brand Safe",
      priorities: ["Realism", "Brand Match", "Face Consistency"],
    },
    references: [
      {
        id: 21,
        title: "City coffee walk",
        vibe: "casual chic",
        gradient: "linear-gradient(160deg,#0f1f37,#294d8b,#0d1731)",
      },
      {
        id: 22,
        title: "Mirror outfit frame",
        vibe: "fashion update",
        gradient: "linear-gradient(160deg,#171735,#4b4db2,#131428)",
      },
      {
        id: 23,
        title: "Night dinner look",
        vibe: "elevated lifestyle",
        gradient: "linear-gradient(160deg,#1b1226,#663779,#140d1f)",
      },
      {
        id: 24,
        title: "Airport fit",
        vibe: "travel luxury",
        gradient: "linear-gradient(160deg,#12263b,#285f8b,#0f1728)",
      },
      {
        id: 25,
        title: "Studio portrait feel",
        vibe: "editorial",
        gradient: "linear-gradient(160deg,#15192a,#404b91,#111420)",
      },
    ],
  },
  {
    id: 3,
    name: "Mira Kline",
    handle: "@mira.kline",
    initials: "MK",
    badge: "91%",
coverImageUrl:
  "https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/mira-kline/Cover.png",
    tags: ["Model", "Beauty"],
    chips: ["Luxury", "Brand-fit", "Niche-auth."],
    glowA: "rgba(236,72,153,.60)",
    glowB: "rgba(168,85,247,.40)",
    bg: "linear-gradient(170deg,#1a0a18 0%,#601040 40%,#3a0828 75%,#200a18 100%)",
    bio: "Luxury beauty and model persona with strong premium brand compatibility. Best for soft glam, beauty storytelling, confident portrait-led lifestyle content, and polished creator visuals.",
    bestFor: ["Beauty campaigns", "Luxury selfies", "Night-out content", "Soft glam storytelling"],
    category: "Beauty",
    niche: "Luxury / Personal Brand",
    recommended: {
      look: "Luxury Realism",
      motion: "Cinematic Social",
      strategy: "Conversion",
      priorities: ["Face Consistency", "Realism", "Brand Match"],
    },
references: [
  {
    id: 31,
    title: "Restaurant candid",
    vibe: "quiet luxury",
    imageUrl:
      "https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/mira-kline/Ref1.png",
  },
  {
    id: 32,
    title: "Mirror glam prep",
    vibe: "beauty routine",
    imageUrl:
      "https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/mira-kline/Ref2.jpeg",
  },
  {
    id: 33,
    title: "Car selfie mood",
    vibe: "realistic luxury",
    gradient: "linear-gradient(160deg,#1a1530,#5b3bb8,#120f24)",
  },
  {
    id: 34,
    title: "Skincare counter",
    vibe: "soft beauty",
    gradient: "linear-gradient(160deg,#231221,#76456a,#180d15)",
  },
  {
    id: 35,
    title: "Dinner table close-up",
    vibe: "premium realism",
    gradient: "linear-gradient(160deg,#291411,#8f4730,#1a0d0c)",
  },
],
  },
  {
    id: 4,
    name: "Nova Reed",
    handle: "@nova.reed",
    initials: "NR",
    badge: "89%",
    tags: ["Tech", "Creator"],
    chips: ["Gen-Z", "Edu-tainment", "High reach"],
    glowA: "rgba(52,211,153,.50)",
    glowB: "rgba(59,130,246,.40)",
    bg: "linear-gradient(170deg,#081a18 0%,#0d4035 40%,#092a24 75%,#061510 100%)",
    bio: "Tech and creator-focused persona built for informative but social-native content. Great for software demos, growth tips, creator education, and modern productivity content.",
    bestFor: ["AI tutorials", "Productivity clips", "Tech creator reels", "Educational social posts"],
    category: "Tech",
    niche: "Education / Creator Economy",
    recommended: {
      look: "Phone Native",
      motion: "Balanced",
      strategy: "Community",
      priorities: ["Realism", "Trend Fit", "Hook Strength"],
    },
    references: [
      {
        id: 41,
        title: "Desk setup reel",
        vibe: "creator desk",
        gradient: "linear-gradient(160deg,#0c1d1a,#1f6d5f,#091311)",
      },
      {
        id: 42,
        title: "Laptop cafe shot",
        vibe: "remote work",
        gradient: "linear-gradient(160deg,#102030,#2c6d8a,#0a131b)",
      },
      {
        id: 43,
        title: "Direct-to-camera tip",
        vibe: "educational",
        gradient: "linear-gradient(160deg,#131f28,#2f5371,#0c141b)",
      },
      {
        id: 44,
        title: "Phone-native explainer",
        vibe: "social tech",
        gradient: "linear-gradient(160deg,#13251e,#366b4f,#0c1713)",
      },
      {
        id: 45,
        title: "Workspace story",
        vibe: "creator daily",
        gradient: "linear-gradient(160deg,#16212c,#425676,#0e141c)",
      },
    ],
  },
  {
    id: 5,
    name: "Zara Voss",
    handle: "@zara.voss",
    initials: "ZV",
    badge: "96%",
    tags: ["Luxury", "Travel"],
    chips: ["HNW audience", "Aspirational", "Collab-ready"],
    glowA: "rgba(251,191,36,.45)",
    glowB: "rgba(236,72,153,.38)",
    bg: "linear-gradient(170deg,#1a140a 0%,#604010 40%,#3a2808 75%,#201408 100%)",
    bio: "Aspirational luxury travel persona with strong premium visual fit. Works best for destination storytelling, boutique hotel content, dinner scenes, and elevated lifestyle campaigns.",
    bestFor: ["Travel reels", "Luxury hotel content", "Brunch and sunset stories", "Destination campaigns"],
    category: "Luxury",
    niche: "Travel / Aspirational Lifestyle",
    recommended: {
      look: "Luxury Realism",
      motion: "Cinematic Social",
      strategy: "Brand Safe",
      priorities: ["Brand Match", "Realism", "Face Consistency"],
    },
    references: [
      {
        id: 51,
        title: "Hotel balcony view",
        vibe: "luxury travel",
        gradient: "linear-gradient(160deg,#261b0f,#8f6521,#1b1209)",
      },
      {
        id: 52,
        title: "Sunset rooftop",
        vibe: "aspirational",
        gradient: "linear-gradient(160deg,#2c1523,#8b3f67,#1a0d15)",
      },
      {
        id: 53,
        title: "Dinner destination look",
        vibe: "premium lifestyle",
        gradient: "linear-gradient(160deg,#20170d,#7a5325,#140f08)",
      },
      {
        id: 54,
        title: "Airport lounge fit",
        vibe: "travel creator",
        gradient: "linear-gradient(160deg,#1a1e26,#5c6b84,#12141a)",
      },
      {
        id: 55,
        title: "Poolside phone moment",
        vibe: "vacation realism",
        gradient: "linear-gradient(160deg,#0f2122,#2d8084,#0b1616)",
      },
    ],
  },
];

const SWIPE_COMMIT_PX = 88;
const SWIPE_COMMIT_VEL = 0.42;
const TAP_THRESHOLD_PX = 10;

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
        whiteSpace: "nowrap",
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
        padding: "5px 13px",
        borderRadius: 999,
        background: accent
          ? "linear-gradient(135deg,rgba(168,85,247,.32),rgba(236,72,153,.24))"
          : "rgba(255,255,255,.08)",
        border: accent
          ? "1px solid rgba(168,85,247,.40)"
          : "1px solid rgba(255,255,255,.12)",
        fontSize: 12,
        fontWeight: 700,
        color: accent ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.75)",
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
        padding: "5px 11px",
        borderRadius: 999,
        background: "rgba(0,0,0,.38)",
        border: "1px solid rgba(255,255,255,.10)",
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(255,255,255,.60)",
        letterSpacing: 0.1,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

function DetailMiniChip({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.10)",
        fontSize: 11,
        fontWeight: 700,
        color: "rgba(255,255,255,.72)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

function HintLabel({ dir, opacity }: { dir: SwipeDir; opacity: number }) {
  if (!dir || opacity < 0.04) return null;

  const isRight = dir === "right";

  return (
    <div
      style={{
        position: "absolute",
        top: 38,
        ...(isRight ? { right: 22 } : { left: 22 }),
        zIndex: 20,
        padding: "6px 14px",
        borderRadius: 10,
        border: isRight
          ? "2.5px solid rgba(168,85,247,.88)"
          : "2.5px solid rgba(239,68,68,.88)",
        color: isRight
          ? "rgba(168,85,247,.96)"
          : "rgba(239,68,68,.92)",
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: 2,
        textTransform: "uppercase",
        opacity,
        transform: isRight ? "rotate(12deg)" : "rotate(-12deg)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        background: isRight
          ? "rgba(168,85,247,.10)"
          : "rgba(239,68,68,.08)",
        pointerEvents: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {isRight ? "YES" : "NOPE"}
    </div>
  );
}

type CardProps = {
  persona: Persona;
  exitDir: SwipeDir;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onExitDone: () => void;
  onOpenDetails: () => void;
};

function PersonaCard({
  persona,
  exitDir,
  onSwipeLeft,
  onSwipeRight,
  onExitDone,
  onOpenDetails,
}: CardProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const curXRef = useRef(0);
  const startTimeRef = useRef(0);

  const rotation = dragX * 0.055;
  const labelDir: SwipeDir = dragX > 22 ? "right" : dragX < -22 ? "left" : null;
  const labelOpacity = Math.min(Math.abs(dragX) / SWIPE_COMMIT_PX, 1);
  const cardOpacity = 1 - Math.max(0, (Math.abs(dragX) - 55) / 230);
  const selectGlow =
    dragX > 30 ? `rgba(168,85,247,${Math.min((dragX - 30) / 130, 0.55)})` : "transparent";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exitDir) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    curXRef.current = e.clientX;
    startTimeRef.current = performance.now();
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || exitDir) return;
    curXRef.current = e.clientX;
    setDragX(e.clientX - startXRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const delta = curXRef.current - startXRef.current;
    const elapsed = performance.now() - startTimeRef.current;
    const velocity = Math.abs(delta) / elapsed;
    const commit = Math.abs(delta) >= SWIPE_COMMIT_PX || velocity >= SWIPE_COMMIT_VEL;

    if (commit) {
      if (delta > 0) onSwipeRight();
      else onSwipeLeft();
      return;
    }

    if (Math.abs(delta) <= TAP_THRESHOLD_PX) {
      onOpenDetails();
    }

    setDragX(0);
  };

  const exitTranslate = exitDir === "right" ? "115vw" : exitDir === "left" ? "-115vw" : null;
  const exitRotate = exitDir === "right" ? 22 : exitDir === "left" ? -22 : null;

  const transform = exitDir
    ? `translateX(${exitTranslate}) rotate(${exitRotate}deg)`
    : `translateX(${dragX}px) rotate(${rotation}deg)`;

  const transition = isDragging
    ? "none"
    : exitDir
    ? "transform 400ms cubic-bezier(.45,0,.55,1), opacity 340ms ease"
    : "transform 340ms cubic-bezier(.18,.89,.32,1.1)";

  const opacity = exitDir ? 0 : cardOpacity;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTransitionEnd={() => {
        if (exitDir) onExitDone();
      }}
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        background: persona.bg,
        border: "1px solid rgba(255,255,255,.10)",
        height: 720,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "22px 22px 24px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        transform,
        opacity,
        transition,
        willChange: "transform, opacity",
        boxShadow:
          `0 0 0 1px rgba(168,85,247,.12),` +
          `0 32px 90px rgba(0,0,0,.75),` +
          `0 0 80px ${persona.glowA},` +
          `0 0 0 3px ${selectGlow},` +
          `inset 0 1px 0 rgba(255,255,255,.08)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -70,
          right: -50,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: persona.glowA,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: persona.glowB,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <HintLabel dir={labelDir} opacity={labelOpacity} />

      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(0,0,0,.40)",
          border: "1px solid rgba(255,255,255,.10)",
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,255,255,.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "rgba(236,72,153,.95)" }}>●</span>
        Tap for details
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
          background: "rgba(0,0,0,.50)",
          border: "1px solid rgba(255,255,255,.12)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,255,255,.88)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#a855f7,#ec4899)",
            boxShadow: "0 0 7px rgba(168,85,247,.9)",
          }}
        />
        {persona.badge}
      </div>

<div
  style={{
    position: "absolute",
    top: 84,
    left: 22,
    right: 22,
    height: 500,
    borderRadius: 28,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.10)",
    boxShadow:
      "0 22px 60px rgba(0,0,0,.36), 0 0 40px rgba(168,85,247,.12)",
    background: persona.coverImageUrl
      ? `url(${persona.coverImageUrl}) center 18% / cover no-repeat`
      : "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.14))",
    pointerEvents: "none",
  }}
>
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(to bottom, rgba(0,0,0,.03) 0%, rgba(0,0,0,.10) 55%, rgba(0,0,0,.16) 100%)",
    }}
  />
</div>

      <div
        style={{
          position: "absolute",
          top: 56,
          left: 20,
          fontSize: 11,
          color: "rgba(255,255,255,.42)",
          fontWeight: 500,
          letterSpacing: 0.3,
          pointerEvents: "none",
        }}
      >
        {persona.handle}
      </div>

<div
  style={{
    position: "relative",
    zIndex: 2,
    pointerEvents: "none",
    marginTop: 126,
  }}
>
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: 0.2,
            color: "rgba(255,255,255,.97)",
            marginBottom: 12,
            lineHeight: 1.05,
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

function ActionButton({
  onClick,
  children,
  variant,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant: "reject" | "select" | "save";
  disabled?: boolean;
}) {
  const variantStyle: Record<"reject" | "select" | "save", React.CSSProperties> = {
    reject: {
      width: 60,
      height: 60,
      borderRadius: 22,
      background: "rgba(239,68,68,.12)",
      border: "1px solid rgba(239,68,68,.30)",
      color: "rgba(239,68,68,.90)",
      boxShadow:
        "0 0 0 1px rgba(239,68,68,.08),0 12px 30px rgba(239,68,68,.16)",
    },
select: {
  width: 74,
  height: 74,
  borderRadius: 26,
  background:
    "linear-gradient(180deg, rgba(255,110,210,.92) 0%, rgba(236,72,153,.88) 55%, rgba(192,132,252,.82) 100%)",
  border: "1px solid rgba(255,200,245,.34)",
  color: "rgba(255,255,255,.98)",
  boxShadow:
    "0 0 0 1px rgba(255,160,230,.12), 0 18px 44px rgba(236,72,153,.34), 0 0 72px rgba(244,114,182,.42)",
},
    save: {
      width: 60,
      height: 60,
      borderRadius: 22,
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.14)",
      color: "rgba(255,255,255,.70)",
      boxShadow:
        "0 0 0 1px rgba(255,255,255,.04),0 12px 30px rgba(0,0,0,.3)",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity 200ms ease",
        ...variantStyle[variant],
      }}
    >
      {children}
    </button>
  );
}

function ReferenceFullscreenPreview({
  persona,
  item,
  currentIndex,
  total,
  open,
  onClose,
  onPrev,
  onNext,
}: {
  persona: Persona | null;
  item: ReferenceItem | null;
  currentIndex: number;
  total: number;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!persona || !item) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 220,
          background: open ? "rgba(0,0,0,.88)" : "rgba(0,0,0,0)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 220ms ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 230,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
          transform: open ? "scale(1)" : "scale(.96)",
          opacity: open ? 1 : 0,
          transition: "transform 220ms ease, opacity 220ms ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 28,
            overflow: "hidden",
            background: item.gradient,
            border: "1px solid rgba(255,255,255,.10)",
            boxShadow: "0 40px 100px rgba(0,0,0,.55)",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 5,
              width: 38,
              height: 38,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(0,0,0,.35)",
              color: "rgba(255,255,255,.92)",
              fontSize: 18,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            ✕
          </button>

          <div
            style={{
              height: 540,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

<div
  style={{
    position: "absolute",
    inset: 0,
    background: item.imageUrl
      ? `url(${item.imageUrl}) center / cover no-repeat`
      : item.gradient,
  }}
/>

<div
  style={{
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,.04) 0%, rgba(0,0,0,.16) 48%, rgba(0,0,0,.44) 100%)",
  }}
/>

            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(0,0,0,.35)",
                border: "1px solid rgba(255,255,255,.10)",
                color: "rgba(255,255,255,.88)",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {currentIndex + 1} / {total}
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(0,0,0,.28)",
                    color: "rgba(255,255,255,.95)",
                    cursor: "pointer",
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(0,0,0,.28)",
                    color: "rgba(255,255,255,.95)",
                    cursor: "pointer",
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div
            style={{
              padding: 16,
              background: "rgba(0,0,0,.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "rgba(255,255,255,.97)",
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                color: "rgba(255,255,255,.62)",
              }}
            >
              {item.vibe}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DiscoverDetailSheet({
  persona,
  open,
  activeReferenceIndex,
  onClose,
  onUse,
  onSaveToCollection,
  onSelectReference,
}: {
  persona: Persona | null;
  open: boolean;
  activeReferenceIndex: number;
  onClose: () => void;
  onUse: () => void;
  onSaveToCollection: () => void;
  onSelectReference: (index: number) => void;
}) {
  if (!persona) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(0,0,0,.58)" : "rgba(0,0,0,0)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 240ms ease",
          zIndex: 120,
        }}
      />

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 130,
          transform: open ? "translateY(0)" : "translateY(102%)",
          transition: "transform 320ms cubic-bezier(.2,.9,.2,1)",
          padding: "0 12px calc(env(safe-area-inset-bottom, 0px) + 10px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderBottomLeftRadius: 22,
            borderBottomRightRadius: 22,
            overflow: "hidden",
            background:
              "linear-gradient(180deg,rgba(18,12,35,.98),rgba(10,8,22,.98))",
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow: "0 -24px 80px rgba(0,0,0,.55)",
            maxHeight: "82vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 10,
              paddingBottom: 6,
            }}
          >
            <div
              style={{
                width: 48,
                height: 5,
                borderRadius: 999,
                background: "rgba(255,255,255,.16)",
              }}
            />
          </div>

          <div
            style={{
              padding: "8px 16px 16px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "rgba(255,255,255,.98)",
                    lineHeight: 1.02,
                  }}
                >
                  {persona.name}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "rgba(255,255,255,.48)",
                  }}
                >
                  {persona.handle} · {persona.category} · {persona.niche}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(255,255,255,.04)",
                  color: "rgba(255,255,255,.85)",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {persona.tags.map((t, i) => (
                <TagPill key={t} label={t} accent={i === 0} />
              ))}
              {persona.chips.map((c) => (
                <FeatureChip key={c} label={c} />
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 18,
                padding: 14,
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.34)",
                  marginBottom: 8,
                }}
              >
                Overview
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,.78)",
                  lineHeight: 1.7,
                }}
              >
                {persona.bio}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 18,
                padding: 14,
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.34)",
                  marginBottom: 10,
                }}
              >
                Best for
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {persona.bestFor.map((item) => (
                  <DetailMiniChip key={item} label={item} />
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 18,
                padding: 14,
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.34)",
                  marginBottom: 10,
                }}
              >
                Recommended controls
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", lineHeight: 1.5 }}>
                  • Look: {persona.recommended.look}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", lineHeight: 1.5 }}>
                  • Motion: {persona.recommended.motion}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", lineHeight: 1.5 }}>
                  • Strategy: {persona.recommended.strategy}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", lineHeight: 1.5 }}>
                  • Priorities: {persona.recommended.priorities.join(" · ")}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.34)",
                  marginBottom: 10,
                }}
              >
                Reference gallery
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {persona.references.map((ref, idx) => {
                  const isActive = idx === activeReferenceIndex;

                  return (
                    <button
                      key={ref.id}
                      type="button"
                      onClick={() => onSelectReference(idx)}
                      style={{
                        flex: "0 0 152px",
                        borderRadius: 18,
                        overflow: "hidden",
                        background: ref.gradient,
                        border: isActive
                          ? "1px solid rgba(168,85,247,.48)"
                          : "1px solid rgba(255,255,255,.10)",
                        boxShadow: isActive
                          ? "0 0 0 1px rgba(168,85,247,.18), 0 18px 40px rgba(168,85,247,.16)"
                          : "0 18px 40px rgba(0,0,0,.28)",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          height: 190,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
<div
  style={{
    position: "absolute",
    inset: 0,
    background: ref.imageUrl
      ? `url(${ref.imageUrl}) center / cover no-repeat`
      : ref.gradient || "linear-gradient(135deg,#5b21b6,#db2777)",
  }}
/>

<div
  style={{
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,.04) 0%, rgba(0,0,0,.18) 48%, rgba(0,0,0,.50) 100%)",
  }}
/>

                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            padding: "5px 8px",
                            borderRadius: 999,
                            background: "rgba(0,0,0,.38)",
                            border: "1px solid rgba(255,255,255,.10)",
                            color: "rgba(255,255,255,.82)",
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          Ref
                        </div>
                      </div>

                      <div
                        style={{
                          padding: 12,
                          background: "rgba(0,0,0,.18)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "rgba(255,255,255,.92)",
                            lineHeight: 1.3,
                          }}
                        >
                          {ref.title}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: "rgba(255,255,255,.55)",
                          }}
                        >
                          {ref.vibe}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 12,
                }}
              >
                {persona.references.map((ref, idx) => (
                  <button
                    key={`dot-${ref.id}`}
                    type="button"
                    onClick={() => onSelectReference(idx)}
                    style={{
                      width: idx === activeReferenceIndex ? 20 : 8,
                      height: 8,
                      borderRadius: 999,
                      border: "none",
                      background:
                        idx === activeReferenceIndex
                          ? "linear-gradient(135deg,#a855f7,#ec4899)"
                          : "rgba(255,255,255,.18)",
                      cursor: "pointer",
                      transition: "width 180ms ease",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={onUse}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(135deg,#a855f7,#ec4899)",
                  color: "rgba(255,255,255,.98)",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 16px 40px rgba(168,85,247,.28)",
                }}
              >
                Use this model
              </button>

              <button
                type="button"
                onClick={onSaveToCollection}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(255,255,255,.04)",
                  color: "rgba(255,255,255,.88)",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save to collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DiscoverPage() {
  const [index, setIndex] = useState(0);
  const [swipes, setSwipes] = useState(4);
  const [exitDir, setExitDir] = useState<SwipeDir>(null);
  const [animating, setAnimating] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeReferenceIndex, setActiveReferenceIndex] = useState(0);

  const persona = useMemo(() => PERSONAS[index % PERSONAS.length], [index]);
  const activeReference = persona.references[activeReferenceIndex] ?? null;

  const savePersona = useCallback((personaToSave: Persona) => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("saved_personas") : null;
    const saved = raw ? JSON.parse(raw) : [];
    const exists = saved.find((p: Persona) => p.id === personaToSave.id);

    if (!exists) {
      saved.push(personaToSave);
      localStorage.setItem("saved_personas", JSON.stringify(saved));
    }
  }, []);

  const setActiveStudioPersona = useCallback((personaToUse: Persona) => {
    localStorage.setItem(
      ACTIVE_PERSONA_KEY,
      JSON.stringify({
        id: `preset-discover-${personaToUse.id}`,
        name: personaToUse.name,
        type: "preset",
        source: "discover",
      })
    );
  }, []);

  const triggerExit = useCallback(
    (dir: "left" | "right") => {
      if (animating) return;
      setAnimating(true);
      setExitDir(dir);
    },
    [animating]
  );

  const handleExitDone = useCallback(() => {
    setIndex((i) => i + 1);
    setSwipes((s) => s + 1);
    setExitDir(null);
    setAnimating(false);
    setActiveReferenceIndex(0);
  }, []);

  const handleReject = useCallback(() => {
    setDetailOpen(false);
    setPreviewOpen(false);
    triggerExit("left");
  }, [triggerExit]);

  const handleSelect = useCallback(() => {
    savePersona(persona);
    setDetailOpen(false);
    setPreviewOpen(false);
    triggerExit("right");
  }, [persona, savePersona, triggerExit]);

  const handleSave = useCallback(() => {
    window.location.href = "/collection";
  }, []);

  const handleRefresh = useCallback(() => {
    setIndex(0);
    setSwipes(0);
    setDetailOpen(false);
    setPreviewOpen(false);
    setActiveReferenceIndex(0);
  }, []);

  const handleUseFromSheet = useCallback(() => {
    savePersona(persona);
    setActiveStudioPersona(persona);
    window.location.href = "/studio";
  }, [persona, savePersona, setActiveStudioPersona]);

  const handleSaveFromSheet = useCallback(() => {
    savePersona(persona);
    window.location.href = "/collection";
  }, [persona, savePersona]);

  const openPreviewAt = useCallback((idx: number) => {
    setActiveReferenceIndex(idx);
    setPreviewOpen(true);
  }, []);

  const showPrevReference = useCallback(() => {
    setActiveReferenceIndex((prev) =>
      prev === 0 ? persona.references.length - 1 : prev - 1
    );
  }, [persona.references.length]);

  const showNextReference = useCallback(() => {
    setActiveReferenceIndex((prev) =>
      prev === persona.references.length - 1 ? 0 : prev + 1
    );
  }, [persona.references.length]);

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,.97)",
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

        <div style={{ position: "relative", marginBottom: 16 }}>
          <div
            style={{
              position: "absolute",
              bottom: -18,
              left: "5%",
              right: "5%",
              height: "100%",
              borderRadius: 28,
              background: "rgba(168,85,247,.03)",
              border: "1px solid rgba(255,255,255,.03)",
              transform: "scaleX(.90)",
              transformOrigin: "bottom",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -9,
              left: "2.5%",
              right: "2.5%",
              height: "100%",
              borderRadius: 28,
              background: "rgba(168,85,247,.025)",
              border: "1px solid rgba(255,255,255,.04)",
              transform: "scaleX(.95)",
              transformOrigin: "bottom",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <PersonaCard
              key={index}
              persona={persona}
              exitDir={exitDir}
              onSwipeLeft={handleReject}
              onSwipeRight={handleSelect}
              onExitDone={handleExitDone}
              onOpenDetails={() => setDetailOpen(true)}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            marginBottom: 18,
          }}
        >
          <ActionButton variant="reject" onClick={handleReject} disabled={animating}>
            <svg
              width="23"
              height="23"
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

          <ActionButton variant="select" onClick={handleSelect} disabled={animating}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </ActionButton>

          <ActionButton variant="save" onClick={handleSave} disabled={animating}>
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
            paddingBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.34)",
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

      <DiscoverDetailSheet
        persona={persona}
        open={detailOpen}
        activeReferenceIndex={activeReferenceIndex}
        onClose={() => setDetailOpen(false)}
        onUse={handleUseFromSheet}
        onSaveToCollection={handleSaveFromSheet}
        onSelectReference={openPreviewAt}
      />

      <ReferenceFullscreenPreview
        persona={persona}
        item={activeReference}
        currentIndex={activeReferenceIndex}
        total={persona.references.length}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onPrev={showPrevReference}
        onNext={showNextReference}
      />
    </AppShell>
  );
}
