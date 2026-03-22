"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

type DiscoverPersona = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  badge?: string;
  tags: string[];
  chips: string[];
  bg?: string;
  cover_image_url?: string;
  bio?: string;
  bestFor?: string[];
  recommended?: {
    look: string;
    motion: string;
    strategy: string;
    priorities: string[];
  };
  references?: Array<{
    id: string;
    title: string;
    vibe?: string;
    image_url?: string;
    gradient?: string;
  }>;
};

const PERSONAS: DiscoverPersona[] = [
  {
    id: 3,
    name: "Mira Kline",
    handle: "@mira.kline",
    initials: "MK",
    badge: "91%",
    tags: ["Model", "Beauty"],
    chips: ["Luxury", "Brand-fit", "Niche-auth."],
    bg: "linear-gradient(180deg,#61124c 0%, #5b103f 34%, #3c0b2b 70%, #1a0814 100%)",
    cover_image_url:
      "https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/mira-kline/Cover.png",
    bio: "Luxury beauty and model persona with strong premium brand compatibility. Best for soft glam, beauty storytelling, confident portrait-led lifestyle content, and polished creator visuals.",
    bestFor: [
      "Beauty campaigns",
      "Luxury selfies",
      "Night-out content",
      "Soft glam storytelling",
    ],
    recommended: {
      look: "Luxury Realism",
      motion: "Cinematic Social",
      strategy: "Conversion",
      priorities: ["Face Consistency", "Realism", "Brand Match"],
    },
    references: [
      {
        id: "mira-ref-1",
        title: "Restaurant candid",
        vibe: "quiet luxury",
        image_url:
          "https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/mira-kline/Ref1.png",
      },
      {
        id: "mira-ref-2",
        title: "Mirror glam prep",
        vibe: "beauty routine",
        image_url:
          "https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/mira-kline/Ref2.jpeg",
      },
      {
        id: "mira-ref-3",
        title: "Car selfie mood",
        vibe: "realistic luxury",
        gradient: "linear-gradient(180deg,#5138cc 0%, #6d5df0 55%, #2c2455 100%)",
      },
      {
        id: "mira-ref-4",
        title: "Skincare counter",
        vibe: "soft beauty",
        gradient: "linear-gradient(180deg,#73406f 0%, #9b6a99 55%, #4a314f 100%)",
      },
      {
        id: "mira-ref-5",
        title: "Dinner table close-up",
        vibe: "premium realism",
        gradient: "linear-gradient(180deg,#8a5327 0%, #b56a37 55%, #4f2d16 100%)",
      },
    ],
  },
  {
    id: 1,
    name: "Luna Vale",
    handle: "@luna.vale",
    initials: "LV",
    badge: "88%",
    tags: ["Lifestyle", "Fashion"],
    chips: ["Soft glam", "Daily content", "UGC-ready"],
    bg: "linear-gradient(180deg,#30255c 0%, #2d2452 40%, #1a1632 100%)",
    bio: "Soft premium lifestyle persona designed for polished, warm, believable social content.",
    bestFor: [
      "Lifestyle posts",
      "Warm UGC",
      "Daily creator content",
      "Soft glam routines",
    ],
    recommended: {
      look: "Warm Lifestyle",
      motion: "Balanced",
      strategy: "Native creator retention",
      priorities: ["Attractive", "Believable", "Creator-native"],
    },
  },
  {
    id: 2,
    name: "Siena Stone",
    handle: "@siena.stone",
    initials: "SS",
    badge: "86%",
    tags: ["Fitness", "Lifestyle"],
    chips: ["UGC", "Magnetic", "Daily-use"],
    bg: "linear-gradient(180deg,#5a301e 0%, #6f4021 40%, #24150e 100%)",
    bio: "High-energy creator persona for magnetic lifestyle and fitness-adjacent content.",
    bestFor: [
      "Fitness hooks",
      "Creator reels",
      "Motivation edits",
      "Daily routines",
    ],
    recommended: {
      look: "Phone Native",
      motion: "Fast Hook",
      strategy: "High-retention creator visuals",
      priorities: ["Hook Strength", "Warmth", "Gaze"],
    },
  },
];

function loadSavedPersonas(): DiscoverPersona[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("saved_personas");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePersona(personaToSave: DiscoverPersona) {
  if (typeof window === "undefined") return;
  const saved = loadSavedPersonas();
  const exists = saved.some((p) => String(p.id) === String(personaToSave.id));
  if (exists) return;
  localStorage.setItem(
    "saved_personas",
    JSON.stringify([...saved, personaToSave])
  );
}

function saveActivePersona(persona: DiscoverPersona) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "active_persona",
    JSON.stringify({
      id: `preset-discover-${persona.id}`,
      name: persona.name,
      source: "preset",
      niche: persona.tags?.[0] ?? "",
      gender: "",
      style: persona.chips?.[0] ?? "",
      face_image_url: persona.cover_image_url ?? "",
    })
  );
}

function TopPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.06)",
        color: "rgba(255,255,255,.60)",
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {children}
    </div>
  );
}

function Tag({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: "7px 12px",
        borderRadius: 999,
        background: accent ? "rgba(192,132,252,.24)" : "rgba(0,0,0,.22)",
        border: accent
          ? "1px solid rgba(216,180,254,.34)"
          : "1px solid rgba(255,255,255,.08)",
        color: "rgba(255,255,255,.92)",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  large = false,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  large?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: large ? 76 : 62,
        height: large ? 76 : 62,
        borderRadius: large ? 24 : 20,
        border: danger
          ? "1px solid rgba(244,63,94,.22)"
          : "1px solid rgba(255,255,255,.10)",
        background: large
          ? "linear-gradient(180deg, rgba(217,70,239,.24), rgba(168,85,247,.28))"
          : danger
          ? "rgba(60,10,20,.36)"
          : "rgba(255,255,255,.04)",
        color: danger ? "#fb7185" : "rgba(255,255,255,.92)",
        fontSize: large ? 30 : 26,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: large
          ? "0 20px 50px rgba(168,85,247,.28), 0 0 40px rgba(236,72,153,.12)"
          : "0 14px 30px rgba(0,0,0,.28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function BookmarkIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 4.75C7 4.06 7.56 3.5 8.25 3.5H15.75C16.44 3.5 17 4.06 17 4.75V20L12 16.8L7 20V4.75Z"
        stroke="rgba(255,255,255,.90)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DiscoverPage() {
  const router = useRouter();

  const personas = useMemo(() => PERSONAS, []);
  const [index, setIndex] = useState(0);
  const [openPersona, setOpenPersona] = useState<DiscoverPersona | null>(null);
  const [savedCount, setSavedCount] = useState(() => loadSavedPersonas().length);
  const [dragX, setDragX] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState<"left" | "right" | null>(
    null
  );

  const startXRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const persona = personas[index % personas.length];

  const goNext = () => {
    setIndex((prev) => (prev + 1) % personas.length);
    setDragX(0);
    setIsAnimatingOut(null);
  };

  const animateAway = (dir: "left" | "right", callback?: () => void) => {
    setIsAnimatingOut(dir);
    window.setTimeout(() => {
      callback?.();
      goNext();
    }, 220);
  };

  const handleDismiss = () => {
    animateAway("left");
  };

  const handleSave = () => {
    savePersona(persona);
    setSavedCount(loadSavedPersonas().length);
    animateAway("right");
  };

  const handleSelect = () => {
    savePersona(persona);
    saveActivePersona(persona);
    setSavedCount(loadSavedPersonas().length);
    router.push("/studio");
  };

  const pointerDown = (clientX: number) => {
    startXRef.current = clientX;
    draggingRef.current = true;
  };

  const pointerMove = (clientX: number) => {
    if (!draggingRef.current || startXRef.current == null) return;
    const delta = clientX - startXRef.current;
    setDragX(delta);
  };

  const pointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (dragX < -85) {
      handleDismiss();
      return;
    }

    if (dragX > 85) {
      handleSave();
      return;
    }

    setDragX(0);
  };

  const cardTransform = isAnimatingOut
    ? isAnimatingOut === "left"
      ? "translateX(-135%) rotate(-14deg)"
      : "translateX(135%) rotate(14deg)"
    : `translateX(${dragX}px) rotate(${dragX / 18}deg)`;

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          overflowY: "auto",
          background:
            "radial-gradient(circle at top, rgba(109,40,217,.18) 0%, rgba(109,40,217,0) 24%), linear-gradient(180deg, #05030c 0%, #090513 42%, #0d081a 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 470,
            margin: "0 auto",
            padding: "20px 18px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                DISCOVER
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,.56)",
                }}
              >
                Your exclusive AI models
              </div>
            </div>

            <div
              style={{
                minWidth: 74,
                height: 40,
                borderRadius: 999,
                background:
                  "linear-gradient(180deg, rgba(168,85,247,.22), rgba(107,33,168,.18))",
                border: "1px solid rgba(255,255,255,.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 12px 30px rgba(168,85,247,.18)",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              <span>⭐</span>
              <span>{savedCount}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <TopPill>model 39%</TopPill>
            <TopPill>fitness 25%</TopPill>
            <TopPill>lifestyle 25%</TopPill>
          </div>

          <div
            style={{
              position: "relative",
              height: 710,
              touchAction: "pan-y",
              userSelect: "none",
            }}
          >
            <div
              onMouseDown={(e) => pointerDown(e.clientX)}
              onMouseMove={(e) => pointerMove(e.clientX)}
              onMouseUp={pointerUp}
              onMouseLeave={pointerUp}
              onTouchStart={(e) => pointerDown(e.touches[0].clientX)}
              onTouchMove={(e) => pointerMove(e.touches[0].clientX)}
              onTouchEnd={pointerUp}
              onClick={() => setOpenPersona(persona)}
              style={{
                position: "relative",
                height: 690,
                borderRadius: 30,
                overflow: "hidden",
                background: persona.bg,
                border: "1px solid rgba(255,255,255,.08)",
                boxShadow:
                  "0 28px 80px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.03) inset",
                transform: cardTransform,
                transition: isAnimatingOut
                  ? "transform .22s ease, opacity .22s ease"
                  : draggingRef.current
                  ? "none"
                  : "transform .18s ease",
                opacity: isAnimatingOut ? 0 : 1,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at top right, rgba(236,72,153,.18) 0%, rgba(236,72,153,0) 35%), radial-gradient(circle at bottom left, rgba(168,85,247,.16) 0%, rgba(168,85,247,0) 35%)",
                  pointerEvents: "none",
                }}
              />

<div
  style={{
    position: "absolute",
    inset: 0,
    background:
      dragX > 0
        ? `linear-gradient(135deg, rgba(236,72,153,${Math.min(
            Math.abs(dragX) / 220,
            0.26
          )}) 0%, rgba(168,85,247,${Math.min(Math.abs(dragX) / 220, 0.18)}) 45%, rgba(0,0,0,0) 100%)`
        : "transparent",
    opacity: dragX > 0 ? 1 : 0,
    transition: draggingRef.current ? "none" : "opacity .18s ease",
    pointerEvents: "none",
    zIndex: 0,
  }}
/>

<div
  style={{
    position: "absolute",
    inset: 0,
    background:
      dragX < 0
        ? `linear-gradient(225deg, rgba(244,63,94,${Math.min(
            Math.abs(dragX) / 220,
            0.24
          )}) 0%, rgba(190,24,93,${Math.min(Math.abs(dragX) / 220, 0.16)}) 45%, rgba(0,0,0,0) 100%)`
        : "transparent",
    opacity: dragX < 0 ? 1 : 0,
    transition: draggingRef.current ? "none" : "opacity .18s ease",
    pointerEvents: "none",
    zIndex: 0,
  }}
/>

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPersona(persona);
                    }}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(0,0,0,.22)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ● Tap for details
                  </button>

                  <div
                    style={{
                      minWidth: 64,
                      height: 34,
                      borderRadius: 999,
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,.22)",
                      border: "1px solid rgba(255,255,255,.10)",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {persona.badge ?? "89%"}
                  </div>
                </div>

                <div
                  style={{
                    position: "relative",
                    height: 430,
                    borderRadius: 28,
                    overflow: "hidden",
                    background: persona.cover_image_url
                      ? `url(${persona.cover_image_url}) center 18% / cover no-repeat`
                      : persona.bg,
                    border: "1px solid rgba(255,255,255,.10)",
                    boxShadow:
                      "0 22px 60px rgba(0,0,0,.36), 0 0 40px rgba(168,85,247,.12)",
                    marginBottom: 16,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,.02) 0%, rgba(0,0,0,.08) 55%, rgba(0,0,0,.16) 100%)",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.56)",
                    }}
                  >
                    {persona.handle}
                  </div>

                  {!persona.cover_image_url && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 56,
                        fontWeight: 900,
                        color: "rgba(255,255,255,.95)",
                      }}
                    >
                      {persona.initials}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    lineHeight: 1.05,
                    marginBottom: 10,
                  }}
                >
                  {persona.name}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {persona.tags.map((tag, i) => (
                    <Tag key={tag} accent={i === 0}>
                      {tag}
                    </Tag>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {persona.chips.map((chip) => (
                    <Tag key={chip}>{chip}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginTop: 18,
            }}
          >
            <ActionButton danger onClick={handleDismiss}>
              ×
            </ActionButton>

            <ActionButton large onClick={handleSave}>
              ★
            </ActionButton>

            <ActionButton onClick={handleSelect}>
              <BookmarkIcon />
            </ActionButton>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13,
              color: "rgba(255,255,255,.48)",
            }}
          >
            <div>7 swipes today</div>
            <button
              type="button"
              onClick={() => setIndex(0)}
              style={{
                border: "none",
                background: "transparent",
                color: "#d06cff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Refresh ↻
            </button>
          </div>
        </div>
      </div>

      {openPersona && (
        <div
          onClick={() => setOpenPersona(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,.62)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              maxHeight: "88vh",
              overflowY: "auto",
              borderRadius: 30,
              background:
                "linear-gradient(180deg, rgba(15,9,34,.98) 0%, rgba(13,8,28,.98) 100%)",
              border: "1px solid rgba(255,255,255,.08)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,.48), 0 0 0 1px rgba(255,255,255,.03) inset",
              padding: 18,
              color: "white",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 54,
                height: 5,
                borderRadius: 999,
                background: "rgba(255,255,255,.20)",
                margin: "0 auto 14px",
              }}
            />

            <button
              type="button"
              onClick={() => setOpenPersona(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 42,
                height: 42,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.04)",
                color: "rgba(255,255,255,.84)",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div style={{ padding: "6px 4px 2px" }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  marginBottom: 6,
                }}
              >
                {openPersona.name}
              </div>

              <div
                style={{
                  color: "rgba(255,255,255,.50)",
                  fontSize: 14,
                  lineHeight: 1.45,
                  marginBottom: 14,
                }}
              >
                {openPersona.handle} • {openPersona.tags?.join(" · ")} •{" "}
                {openPersona.chips?.[0] ?? "Luxury / Personal Brand"}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                {openPersona.tags.map((tag, i) => (
                  <Tag key={tag} accent={i === 0}>
                    {tag}
                  </Tag>
                ))}
                {openPersona.chips.map((chip) => (
                  <Tag key={chip}>{chip}</Tag>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 22,
                  padding: 16,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,.38)",
                    marginBottom: 10,
                  }}
                >
                  OVERVIEW
                </div>

                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,.84)",
                  }}
                >
                  {openPersona.bio ??
                    "Premium creator persona designed for magnetic, polished, believable social content with strong face consistency."}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  padding: 16,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,.38)",
                    marginBottom: 12,
                  }}
                >
                  BEST FOR
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {(openPersona.bestFor?.length
                    ? openPersona.bestFor
                    : [
                        "Beauty campaigns",
                        "Luxury selfies",
                        "Night-out content",
                        "Soft glam storytelling",
                      ]
                  ).map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "9px 14px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid rgba(255,255,255,.08)",
                        color: "rgba(255,255,255,.82)",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 22,
                  padding: 16,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,.38)",
                    marginBottom: 12,
                  }}
                >
                  RECOMMENDED CONTROLS
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    color: "rgba(255,255,255,.82)",
                    fontSize: 15,
                    lineHeight: 1.55,
                  }}
                >
                  <div>• Look: {openPersona.recommended?.look ?? "Luxury Realism"}</div>
                  <div>• Motion: {openPersona.recommended?.motion ?? "Cinematic Social"}</div>
                  <div>
                    • Strategy: {openPersona.recommended?.strategy ?? "Conversion"}
                  </div>
                  <div>
                    • Priorities:{" "}
                    {(openPersona.recommended?.priorities?.length
                      ? openPersona.recommended.priorities
                      : ["Face Consistency", "Realism", "Brand Match"]
                    ).join(" · ")}
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,.38)",
                    margin: "4px 2px 12px",
                  }}
                >
                  REFERENCE GALLERY
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                  }}
                >
                  {(openPersona.references?.length
                    ? openPersona.references
                    : [
                        {
                          id: "fallback-1",
                          title: "Restaurant candid",
                          vibe: "quiet luxury",
                          gradient:
                            "linear-gradient(160deg,#210d1a,#7e2853,#170b13)",
                        },
                        {
                          id: "fallback-2",
                          title: "Mirror glam prep",
                          vibe: "beauty routine",
                          gradient:
                            "linear-gradient(160deg,#2a1022,#a53572,#1a0a14)",
                        },
                        {
                          id: "fallback-3",
                          title: "Car selfie mood",
                          vibe: "realistic luxury",
                          gradient:
                            "linear-gradient(160deg,#4530a8,#6d4cff,#25195e)",
                        },
                        {
                          id: "fallback-4",
                          title: "Skincare counter",
                          vibe: "soft beauty",
                          gradient:
                            "linear-gradient(160deg,#6c3468,#b06ba6,#5a2c57)",
                        },
                        {
                          id: "fallback-5",
                          title: "Dinner table close-up",
                          vibe: "premium realism",
                          gradient:
                            "linear-gradient(160deg,#7a3d1d,#d47a37,#5c2610)",
                        },
                      ]
                  ).map((ref) => (
                    <div
                      key={ref.id}
                      style={{
                        borderRadius: 18,
                        overflow: "hidden",
                        background: ref.image_url
                          ? `url(${ref.image_url}) center / cover no-repeat`
                          : ref.gradient ||
                            "linear-gradient(135deg,#5b21b6,#db2777)",
                        minHeight: 220,
                        position: "relative",
                        border: "1px solid rgba(255,255,255,.08)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,.04) 0%, rgba(0,0,0,.18) 48%, rgba(0,0,0,.74) 100%)",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          left: 12,
                          right: 12,
                          bottom: 12,
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            color: "white",
                            fontWeight: 800,
                            fontSize: 15,
                            marginBottom: 2,
                          }}
                        >
                          {ref.title}
                        </div>
                        {ref.vibe && (
                          <div
                            style={{
                              color: "rgba(255,255,255,.72)",
                              fontSize: 12,
                            }}
                          >
                            {ref.vibe}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
