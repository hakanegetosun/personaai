"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { PRESET_INFLUENCERS } from "@/data/preset-influencers";
import { DISCOVER_PRESETS } from "@/data/discover-presets";
import { saveActivePersona, loadActivePersona } from "@/types/persona";
import type { ActivePersona, PresetInfluencer } from "@/types/persona";
import AppShell from "@/components/AppShell";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type NicheFilter = "all" | "fitness" | "fashion" | "lifestyle" | "business";

type SavedPersona = {
  id: number;
  preset_id?: string;
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
references?: Array<{
  id: string;
  title: string;
  vibe?: string;
  image_url?: string;
  gradient?: string;
}>;
recommended?: {
  look: string;
  motion: string;
  strategy: string;
  priorities: string[];
};
};

type CustomPersonaRow = {
  id: string;
  name: string;
  description: string | null;
  face_image_url: string | null;
  niche: string | null;
  gender: string | null;
  style: string | null;
  personality: string | null;
};

const NICHE_FILTERS: { value: NicheFilter; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "✦" },
  { value: "fitness", label: "Fitness", emoji: "🏋️" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "lifestyle", label: "Lifestyle", emoji: "✨" },
  { value: "business", label: "Business", emoji: "💼" },
];

const NICHE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  fitness: {
    bg: "rgba(249,115,22,0.15)",
    text: "#fb923c",
    border: "rgba(249,115,22,0.3)",
  },
  fashion: {
    bg: "rgba(236,72,153,0.15)",
    text: "#f472b6",
    border: "rgba(236,72,153,0.3)",
  },
  lifestyle: {
    bg: "rgba(168,85,247,0.15)",
    text: "#c084fc",
    border: "rgba(168,85,247,0.3)",
  },
  business: {
    bg: "rgba(34,211,238,0.12)",
    text: "#67e8f9",
    border: "rgba(34,211,238,0.25)",
  },
};

const STYLE_LABELS: Record<string, string> = {
  luxury: "Luxury",
  casual: "Casual",
  gym: "Gym",
  influencer: "Influencer",
  "minimal luxury": "Minimal Luxury",
  "soft glam": "Soft Glam",
  "clean girl": "Clean Girl",
  "sporty premium": "Sporty Premium",
  streetwear: "Streetwear",
  editorial: "Editorial",
  "dark feminine": "Dark Feminine",
  "old money": "Old Money",
  "modern chic": "Modern Chic",
  "warm natural": "Warm Natural",
};

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function getNicheStyle(niche: string) {
  return (
    NICHE_COLORS[niche] ?? {
      bg: "rgba(255,255,255,0.08)",
      text: "rgba(255,255,255,0.5)",
      border: "rgba(255,255,255,0.15)",
    }
  );
}

function toActivePersonaFromPreset(influencer: PresetInfluencer): ActivePersona {
  return {
    id: influencer.id,
    name: influencer.name,
    niche: influencer.niche,
    gender: influencer.gender,
    style: influencer.style,
    face_image_url: influencer.face_image_url,
    source: "preset",
  };
}

function toActivePersonaFromCustom(persona: CustomPersonaRow): ActivePersona {
  return {
    id: persona.id,
    name: persona.name,
niche: persona.niche ?? "",
gender: persona.gender ?? "",
style: persona.style ?? "",
face_image_url: persona.face_image_url ?? "",
    source: "custom",
  };
}

function matchesFilter(niche: string | null | undefined, filter: NicheFilter) {
  if (filter === "all") return true;
  return (niche ?? "").toLowerCase() === filter;
}

function getStyleLabel(style?: string | null) {
  if (!style) return "Custom";
  return STYLE_LABELS[style.toLowerCase()] ?? style;
}

// -----------------------------------------------------------------------
// Reusable Card
// -----------------------------------------------------------------------

function PersonaCard({
  id,
  name,
  niche,
  style,
  bio,
  imageUrl,
  isActive,
  isSelecting,
  selectingLocked,
onSelect,
onEdit,
onSecondaryAction,
secondaryActionLabel,
isCustom = false,
}: {
  id: string;
  name: string;
  niche?: string | null;
  style?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isSelecting: boolean;
  selectingLocked: boolean;
onSelect: () => void;
onEdit?: () => void;
onSecondaryAction?: () => void;
secondaryActionLabel?: string;
isCustom?: boolean;
}) {
  const nicheStyle = getNicheStyle((niche ?? "").toLowerCase());

  return (
    <div
      key={id}
      onClick={onSelect}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: isActive
          ? "1.5px solid rgba(168,85,247,0.7)"
          : "1px solid rgba(255,255,255,0.08)",
        background: isActive
          ? "linear-gradient(145deg, rgba(168,85,247,0.12), rgba(236,72,153,0.06))"
          : "rgba(255,255,255,0.03)",
        cursor: selectingLocked ? "default" : "pointer",
        opacity: selectingLocked && !isSelecting ? 0.5 : 1,
        transition: "all 0.2s",
        transform: isSelecting ? "scale(0.97)" : "scale(1)",
        position: "relative",
      }}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            borderRadius: 999,
            padding: "3px 8px",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",
            color: "#fff",
            letterSpacing: "0.04em",
          }}
        >
          ACTIVE
        </div>
      )}

      {isSelecting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,10,15,0.6)",
            backdropFilter: "blur(4px)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "2.5px solid rgba(168,85,247,0.3)",
              borderTop: "2.5px solid #a855f7",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div
        style={{
          width: "100%",
          aspectRatio: "3/4",
          background: imageUrl
            ? `url(${imageUrl}) center top / cover no-repeat`
            : "linear-gradient(180deg, rgba(168,85,247,0.18), rgba(236,72,153,0.10))",
          position: "relative",
          display: "flex",
          alignItems: imageUrl ? "stretch" : "center",
          justifyContent: imageUrl ? "stretch" : "center",
        }}
      >
        {!imageUrl && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "rgba(255,255,255,0.55)",
              textAlign: "center",
              padding: "0 14px",
            }}
          >
            No image yet
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(10,10,15,0.95) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 10px 10px",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              margin: "0 0 4px",
              lineHeight: 1.1,
            }}
          >
            {name}
          </p>

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {niche && (
              <span
                style={{
                  background: nicheStyle.bg,
                  border: `1px solid ${nicheStyle.border}`,
                  color: nicheStyle.text,
                  fontSize: 10,
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 999,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {niche}
              </span>
            )}

            <span
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.45)",
                fontSize: 10,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 999,
                letterSpacing: "0.03em",
              }}
            >
              {getStyleLabel(style)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 10px 12px" }}>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            fontFamily: "DM Sans, sans-serif",
            margin: "0 0 8px",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 32,
          }}
        >
          {bio || "Custom persona ready for consistent content generation."}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 10,
            border: isActive
              ? "1px solid rgba(168,85,247,0.5)"
              : "1px solid rgba(255,255,255,0.1)",
            background: isActive
              ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))"
              : "rgba(255,255,255,0.05)",
            color: isActive ? "#e879f9" : "rgba(255,255,255,0.55)",
            fontSize: 12,
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 700,
            cursor: selectingLocked ? "default" : "pointer",
            transition: "all 0.15s",
            pointerEvents: selectingLocked ? "none" : "auto",
          }}
        >
          {isActive ? "✓ Selected" : "Select"}
        </button>

{isCustom && onEdit && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onEdit();
    }}
    style={{
      width: "100%",
      marginTop: 8,
      padding: "8px 0",
      borderRadius: 10,
      border: "1px solid rgba(168,85,247,0.18)",
      background: "rgba(168,85,247,0.08)",
      color: "rgba(255,255,255,0.82)",
      fontSize: 12,
      fontFamily: "DM Sans, sans-serif",
      fontWeight: 700,
      cursor: selectingLocked ? "default" : "pointer",
      pointerEvents: selectingLocked ? "none" : "auto",
    }}
  >
    Edit
  </button>
)}

{onSecondaryAction && secondaryActionLabel && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onSecondaryAction();
    }}
    style={{
      width: "100%",
      marginTop: 8,
      padding: "8px 0",
      borderRadius: 10,
      border: "1px solid rgba(239,68,68,0.18)",
      background: "rgba(239,68,68,0.08)",
      color: "rgba(255,255,255,0.72)",
      fontSize: 12,
      fontFamily: "DM Sans, sans-serif",
      fontWeight: 700,
      cursor: selectingLocked ? "default" : "pointer",
      pointerEvents: selectingLocked ? "none" : "auto",
    }}
  >
    {secondaryActionLabel}
  </button>
)}

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export default function CollectionPage() {
  const router = useRouter();

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [filter, setFilter] = useState<NicheFilter>("all");
const [savedPersonas, setSavedPersonas] = useState<SavedPersona[]>([]);
const [selectingSavedId, setSelectingSavedId] = useState<number | null>(null);
const [openSavedPersona, setOpenSavedPersona] = useState<SavedPersona | null>(null); 
 const [activeId, setActiveId] = useState<string | null>(null);
const [activeSource, setActiveSource] = useState<"preset" | "custom" | "discover" | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [customPersonas, setCustomPersonas] = useState<CustomPersonaRow[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
const [hiddenPresetIds, setHiddenPresetIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadActivePersona();
    if (saved) {
      setActiveId(saved.id);
      setActiveSource((saved.source as "preset" | "custom") ?? null);
    }
  }, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem("saved_personas");
  const saved: SavedPersona[] = raw ? JSON.parse(raw) : [];
  setSavedPersonas(saved);
}, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomPersonas() {
      setLoadingCustom(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

if (!user) {
  if (!cancelled) {
    setCustomPersonas([]);
    setHiddenPresetIds([]);
  }
  return;
}

        const { data, error } = await supabase
          .from("personas")
          .select(
            "id, name, description, face_image_url, niche, gender, style, personality"
          )
          .eq("user_id", user.id)
          .eq("is_custom", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

const { data: hiddenRows, error: hiddenError } = await supabase
  .from("hidden_preset_personas")
  .select("preset_id")
  .eq("user_id", user.id);

if (hiddenError) {
  throw hiddenError;
}

if (!cancelled) {
  setCustomPersonas((data ?? []) as CustomPersonaRow[]);
  setHiddenPresetIds(
    hiddenRows?.map((row: { preset_id: string }) => row.preset_id) ?? []
  );
}
      } catch (error) {
        console.error("[Collection] Failed to load custom personas:", error);
        if (!cancelled) {
          setCustomPersonas([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCustom(false);
        }
      }
    }

    void loadCustomPersonas();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

const filteredPresets = useMemo(() => {
  const base =
    filter === "all"
      ? PRESET_INFLUENCERS
      : PRESET_INFLUENCERS.filter((p) => p.niche === filter);

  return base.filter((p) => !hiddenPresetIds.includes(p.id));
}, [filter, hiddenPresetIds]);

  const filteredCustom = useMemo(() => {
    return customPersonas.filter((p) => matchesFilter(p.niche, filter));
  }, [customPersonas, filter]);

  function handleSelectPreset(influencer: PresetInfluencer) {
    if (selectingId) return;

    setSelectingId(influencer.id);

    const persona = toActivePersonaFromPreset(influencer);
    saveActivePersona(persona);
    setActiveId(influencer.id);
    setActiveSource("preset");

    window.setTimeout(() => {
      router.push("/studio");
    }, 350);
  }

  function handleSelectCustom(personaRow: CustomPersonaRow) {
    if (selectingId) return;

    setSelectingId(personaRow.id);

    const persona = toActivePersonaFromCustom(personaRow);
    saveActivePersona(persona);
    setActiveId(personaRow.id);
    setActiveSource("custom");

    window.setTimeout(() => {
      router.push("/studio");
    }, 350);
  }

function handleEditCustom(personaRow: CustomPersonaRow) {
  router.push(`/persona/${personaRow.id}/edit`);
}

async function handleHidePreset(influencer: PresetInfluencer) {
  const confirmed = window.confirm(
    `Hide "${influencer.name}" from your collection?`
  );

  if (!confirmed) return;

  try {
    setSelectingId(influencer.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSelectingId(null);
      return;
    }

    const { error } = await supabase.from("hidden_preset_personas").insert({
      user_id: user.id,
      preset_id: influencer.id,
    });

    if (error) throw error;

    setHiddenPresetIds((prev) => [...prev, influencer.id]);

    if (activeId === influencer.id && activeSource === "preset") {
      const remaining = PRESET_INFLUENCERS.filter(
        (p) => p.id !== influencer.id && !hiddenPresetIds.includes(p.id)
      );

      if (remaining.length > 0) {
        const fallback = toActivePersonaFromPreset(remaining[0]);
        saveActivePersona(fallback);
        setActiveId(fallback.id);
        setActiveSource("preset");
      }
    }
  } catch (error) {
    console.error("[Collection] Failed to hide preset:", error);
    alert(error instanceof Error ? error.message : "Failed to hide preset.");
  } finally {
    setSelectingId(null);
  }
}

async function handleDeleteCustom(personaRow: CustomPersonaRow) {
  const confirmed = window.confirm(
    `Delete "${personaRow.name}"? This will also remove its reference images.`
  );

  if (!confirmed) return;

  try {
    setSelectingId(personaRow.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSelectingId(null);
      return;
    }

    const { error } = await supabase
      .from("personas")
      .delete()
      .eq("id", personaRow.id)
      .eq("user_id", user.id);

    if (error) throw error;

    setCustomPersonas((prev) => prev.filter((p) => p.id !== personaRow.id));

    if (activeId === personaRow.id && activeSource === "custom") {
      const fallback = toActivePersonaFromPreset(PRESET_INFLUENCERS[0]);
      saveActivePersona(fallback);
      setActiveId(fallback.id);
      setActiveSource("preset");
    }
  } catch (error) {
    console.error("[Collection] Failed to delete persona:", error);
    alert(error instanceof Error ? error.message : "Failed to delete persona.");
  } finally {
    setSelectingId(null);
  }
}

const visibleSavedPersonas = savedPersonas.filter((persona) => {
  if (filter === "all") return true;

  const matchesTag = persona.tags?.some(
    (tag) => tag.toLowerCase() === filter.toLowerCase()
  );

  const matchesChip = persona.chips?.some(
    (chip) => chip.toLowerCase() === filter.toLowerCase()
  );

  return matchesTag || matchesChip;
});

const handleSelectSavedPersona = (persona: SavedPersona) => {
  if (selectingSavedId) return;

  setSelectingSavedId(persona.id);

  const matchedPreset = DISCOVER_PRESETS.find(
    (preset) => preset.name.trim().toLowerCase() === persona.name.trim().toLowerCase()
  );

  const resolvedId =
    typeof persona.preset_id === "string" && persona.preset_id.trim().length > 0
      ? persona.preset_id
      : matchedPreset?.presetId ?? String(persona.id);

  saveActivePersona({
    id: resolvedId,
    name: persona.name,
    source: "discover",
    niche: persona.tags?.[0] ?? "",
    gender: "",
    style: persona.chips?.[0] ?? "",
    face_image_url: persona.cover_image_url ?? "",
    cover_image_url: persona.cover_image_url ?? "",
    references: Array.isArray(persona.references) ? persona.references : [],
  });

  setActiveId(resolvedId);
  setActiveSource("discover");
  setOpenSavedPersona(null);

  window.setTimeout(() => {
    router.push("/studio");
  }, 350);
};

const handleDeleteSavedPersona = (personaId: number) => {
  const next = savedPersonas.filter((p) => p.id !== personaId);
  setSavedPersonas(next);
  localStorage.setItem("saved_personas", JSON.stringify(next));
};

  return (
    <AppShell>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        <div
          style={{
            padding: "24px 20px 0",
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.08) 0%, transparent 100%)",
          }}
        >
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 4px",
            }}
          >
            Collection
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 13,
              fontFamily: "DM Sans, sans-serif",
              margin: "0 0 20px",
            }}
          >
Your saved AI personas
          </p>

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 16,
              scrollbarWidth: "none",
            }}
          >
            {NICHE_FILTERS.map((f) => {
              const isActive = filter === f.value;

              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: isActive
                      ? "1px solid rgba(168,85,247,0.6)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.12))"
                      : "rgba(255,255,255,0.04)",
                    color: isActive ? "#e879f9" : "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: isActive ? 700 : 500,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 12 }}>{f.emoji}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "4px 16px 0" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.32)",
              marginBottom: 12,
            }}
          >
Saved Personas
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "0 16px 16px",
          }}
        >
{visibleSavedPersonas.length === 0 ? (
  <div
    style={{
      gridColumn: "1 / -1",
      padding: 18,
      borderRadius: 18,
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.08)",
      color: "rgba(255,255,255,.62)",
      fontSize: 14,
    }}
  >
No saved personas yet. Swipe right in Discover to save personas here.
  </div>
) : (
  visibleSavedPersonas.map((persona) => (
<div
  key={persona.id}
  onClick={() => setOpenSavedPersona(persona)}
  style={{
        borderRadius: 22,
        overflow: "hidden",
        background: "rgba(255,255,255,.03)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        minHeight: 220,
        border: "1px solid rgba(255,255,255,.10)",
        boxShadow: "0 18px 40px rgba(0,0,0,.32)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
cursor: "pointer",
      }}
    >
      <div
        style={{
          height: 220,
          background: persona.cover_image_url
            ? `url(${persona.cover_image_url}) center / cover no-repeat`
            : persona.bg ||
              "linear-gradient(170deg,#1a0a2e 0%,#2d1060 40%,#180830 75%,#0f0820 100%)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: 18,
          width: "100%",
          marginTop: "auto",
        }}
      >
        <div
style={{
  fontSize: 22,
  lineHeight: 1.05,
  letterSpacing: -0.3,
  fontWeight: 900,
  color: "rgba(255,255,255,.98)",
  marginBottom: 6,
}}
        >
          {persona.name}
        </div>

        <div
style={{
  fontSize: 12,
  color: "rgba(255,255,255,.58)",
  marginBottom: 12,
}}
        >
          {persona.handle}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {persona.tags?.map((tag) => (
            <div
              key={tag}
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(255,255,255,.10)",
                border: "1px solid rgba(255,255,255,.14)",
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.88)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 16,
  }}
>
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleSelectSavedPersona(persona);
  }}
  style={{
    height: 44,
    borderRadius: 14,
    border:
      selectingSavedId === persona.id
        ? "1px solid rgba(236,72,153,.55)"
        : "1px solid rgba(168,85,247,.35)",
    background:
      selectingSavedId === persona.id
        ? "linear-gradient(180deg, rgba(236,72,153,.22), rgba(168,85,247,.20))"
        : "linear-gradient(180deg, rgba(168,85,247,.20), rgba(91,33,182,.16))",
    color: "white",
    fontWeight: 800,
    fontSize: 16,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow:
      selectingSavedId === persona.id
        ? "0 8px 24px rgba(236,72,153,.18)"
        : "0 8px 24px rgba(168,85,247,.14)",
  }}
>
  {selectingSavedId === persona.id ? "✓ Selected" : "Select"}
</button>

<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteSavedPersona(persona.id);
  }}
  style={{
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(180deg, rgba(120,20,40,.30), rgba(70,12,24,.24))",
    color: "white",
    fontWeight: 800,
    fontSize: 16,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(120,20,40,.14)",
  }}
>
  Delete
</button>
</div>

      </div>
    </div>
  ))
)}
        </div>

        <div style={{ padding: "0 16px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.32)",
              }}
            >
              My Personas
            </div>

            <button
              type="button"
              onClick={() => router.push("/persona/create")}
              style={{
                border: "1px solid rgba(168,85,247,0.22)",
                background:
                  "linear-gradient(135deg, rgba(168,85,247,0.16), rgba(236,72,153,0.10))",
                color: "rgba(255,255,255,0.92)",
                fontSize: 11,
                fontWeight: 800,
                padding: "8px 12px",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              + Create Persona
            </button>
          </div>
        </div>

        {loadingCustom ? (
          <div
            style={{
              padding: "0 16px 16px",
              color: "rgba(255,255,255,0.42)",
              fontSize: 13,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Loading custom personas...
          </div>
        ) : filteredCustom.length === 0 ? (
          <div
            style={{
              margin: "0 16px 16px",
              borderRadius: 16,
              padding: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 6,
                fontFamily: "Syne, sans-serif",
              }}
            >
              No custom personas yet
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.42)",
                fontSize: 12,
                lineHeight: 1.5,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Create your own persona and it will appear here for fast selection.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              padding: "0 16px 16px",
            }}
          >
            {filteredCustom.map((personaRow) => (
<PersonaCard
  key={personaRow.id}
  id={personaRow.id}
  name={personaRow.name}
  niche={personaRow.niche}
  style={personaRow.style}
  bio={personaRow.description || personaRow.personality}
  imageUrl={personaRow.face_image_url}
  isActive={activeId === personaRow.id && activeSource === "custom"}
  isSelecting={selectingId === personaRow.id}
  selectingLocked={Boolean(selectingId)}
  onSelect={() => handleSelectCustom(personaRow)}
  onEdit={() => handleEditCustom(personaRow)}
  onSecondaryAction={() => void handleDeleteCustom(personaRow)}
  secondaryActionLabel="Delete"
  isCustom
/>
            ))}
          </div>
        )}
      </div>

{openSavedPersona && (
  <div
    onClick={() => setOpenSavedPersona(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(920px, 100%)",
        maxHeight: "85vh",
        overflowY: "auto",
        borderRadius: 28,
        background: "linear-gradient(180deg, rgba(22,12,40,.98), rgba(18,10,34,.98))",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 30px 100px rgba(0,0,0,.45)",
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "white",
              marginBottom: 6,
            }}
          >
            {openSavedPersona.name}
          </div>

          <div
            style={{
              color: "rgba(255,255,255,.58)",
              fontSize: 14,
            }}
          >
            {openSavedPersona.handle}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenSavedPersona(null)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.10)",
            background: "rgba(255,255,255,.04)",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.06)",
          color: "rgba(255,255,255,.84)",
        }}
      >
        Saved persona details will appear here.
      </div>
    </div>
  </div>
)}

{openSavedPersona && (
  <div
    onClick={() => setOpenSavedPersona(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "min(920px, 100%)",
        maxHeight: "85vh",
        overflowY: "auto",
        borderRadius: 28,
        background:
          "linear-gradient(180deg, rgba(22,12,40,.98), rgba(18,10,34,.98))",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 30px 100px rgba(0,0,0,.45)",
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "white",
              marginBottom: 6,
            }}
          >
            {openSavedPersona.name}
          </div>

          <div
            style={{
              color: "rgba(255,255,255,.58)",
              fontSize: 14,
            }}
          >
            {openSavedPersona.handle}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenSavedPersona(null)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.10)",
            background: "rgba(255,255,255,.04)",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ×
        </button>
      </div>

      {openSavedPersona.bio && (
        <div
          style={{
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
            color: "rgba(255,255,255,.84)",
            marginBottom: 18,
          }}
        >
          {openSavedPersona.bio}
        </div>
      )}

      {openSavedPersona.recommended && (
        <div
          style={{
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
            color: "rgba(255,255,255,.86)",
            marginBottom: 18,
          }}
        >
          <div><strong>Look:</strong> {openSavedPersona.recommended.look}</div>
          <div><strong>Motion:</strong> {openSavedPersona.recommended.motion}</div>
          <div><strong>Strategy:</strong> {openSavedPersona.recommended.strategy}</div>
          {!!openSavedPersona.recommended.priorities?.length && (
            <div style={{ marginTop: 8 }}>
              <strong>Priorities:</strong>{" "}
              {openSavedPersona.recommended.priorities.join(" · ")}
            </div>
          )}
        </div>
      )}

      {openSavedPersona.references?.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {openSavedPersona.references.map((ref) => (
            <div
              key={ref.id}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                background: ref.image_url
                  ? `url(${ref.image_url}) center / cover no-repeat`
                  : ref.gradient || "linear-gradient(135deg,#5b21b6,#db2777)",
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
                    "linear-gradient(to bottom, rgba(0,0,0,.06) 0%, rgba(0,0,0,.20) 45%, rgba(0,0,0,.72) 100%)",
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
                <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>
                  {ref.title}
                </div>
                {ref.vibe && (
                  <div
                    style={{
                      color: "rgba(255,255,255,.72)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {ref.vibe}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </div>
)}
</AppShell>
  );
}
