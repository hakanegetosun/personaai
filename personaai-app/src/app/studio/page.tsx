"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { createBrowserClient } from "@supabase/ssr";
import { resolvePlan } from "@/config/plans";
import ReelGenerationLoader from "@/components/ReelGenerationLoader";
import PremiumBoostPanel from "@/components/studio/PremiumBoostPanel";
import { getSafeReelDuration, isReelDurationAllowed, shouldShow15SecWarning } from "@/lib/generation/reel-duration";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "calendar" | "notes" | "brand";

type PlanItem = {
  day: string;
  title: string;
  type: string;
  locked?: boolean;
};

type GeneratedFormat = "reel" | "story" | "post";

type GeneratedResult = {
  title: string;
  caption: string;
  video_url: string;
  thumbnail_url: string;
  format: GeneratedFormat;
};

type GenerateSuccessResponse = {
  success: true;
  mode?: "direct" | "async_reel";
  jobId?: string;
  status?: "queued" | "processing" | "completed" | "failed";
  content?: GeneratedResult;
  usageType: "video" | "story" | "post";
  usage: { used: number; limit: number; remaining: number };
};
type JobStatusResponse =
  | {
      success: true;
      job: {
        id: string;
        status: "queued" | "processing" | "completed" | "failed";
        title?: string | null;
        caption?: string | null;
        image_url?: string | null;
        video_url?: string | null;
        thumbnail_url?: string | null;
        error_message?: string | null;
      };
    }
  | {
      success: false;
      error: string;
      message?: string;
    };
type GenerateErrorResponse = {
  success: false;
  error: string;
  message: string;
  onDemand?: {
    enabled: boolean;
    extraVideoPriceUsd: number;
    extraVideoPack5PriceUsd: number;
  };
};

type GenerateResponse = GenerateSuccessResponse | GenerateErrorResponse;

type ActivePersona = {
  id: string;
  name: string;
  type: "preset" | "custom";
  source: "collection" | "custom" | "discover";
};

type ResolvedPlan = {
  id: string;
  limits: {
    video: number;
    post: number;
    story: number;
  };
  onDemand: {
    enabled: boolean;
    extraVideoPriceUsd: number;
    extraVideoPack5PriceUsd: number;
  };
};

type ContentUsage = {
  video: { used: number; limit: number };
  post: { used: number; limit: number };
  story: { used: number; limit: number };
};

type CalendarEntryRow = {
  id: string;
  day_number: number;
  content_date: string;
  content_type: "story" | "reel" | "post";
  title: string;
  hook?: string | null;
  caption?: string | null;
  status: "planned" | "generated" | "published" | "failed";
};

type PersonaMetaRow = {
  advanced_prompt_notes?: string | null;
  brand_direction?: string | null;
  brand_keywords?: string | null;
  visual_do_not_use?: string | null;
  niche?: string | null;
};

type SmartControlKey = "strategy" | "look" | "motion" | "priorities";

type SmartControlsState = {
  strategy: string | null;
  look: string | null;
  motion: string | null;
  priorities: string[];
  customNote: string;
};

type SmartControlOption = {
  label: string;
  value: string;
  helper?: string;
};

type SmartControlCardConfig = {
  key: SmartControlKey;
  title: string;
  icon: string;
  emptyLabel: string;
  helper: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAD =
  "linear-gradient(135deg,rgba(168,85,247,.28),rgba(236,72,153,.22),rgba(99,102,241,.20))";

const TYPE_STYLES: Record<string, React.CSSProperties> = {
  Reel: {
    background: "rgba(168,85,247,.12)",
    border: "1px solid rgba(168,85,247,.40)",
    color: "rgba(200,150,255,.92)",
  },
  Short: {
    background: "rgba(99,102,241,.12)",
    border: "1px solid rgba(99,102,241,.40)",
    color: "rgba(160,165,255,.92)",
  },
  Story: {
    background: "rgba(236,72,153,.12)",
    border: "1px solid rgba(236,72,153,.40)",
    color: "rgba(255,160,200,.92)",
  },
  Post: {
    background: "rgba(59,130,246,.12)",
    border: "1px solid rgba(59,130,246,.40)",
    color: "rgba(150,200,255,.92)",
  },
};

const CONTENT_TYPE_OPTIONS = [
  { value: "reel", label: "Reel", icon: "🎬" },
  { value: "story", label: "Story", icon: "✨" },
  { value: "post", label: "Post", icon: "📝" },
] as const;

const PRESET_PERSONAS: ActivePersona[] = [
  { id: "preset-mira-kline", name: "Mira Kline", type: "preset", source: "collection" },
  { id: "preset-alex-storm", name: "Alex Storm", type: "preset", source: "collection" },
  { id: "preset-sofia-reyes", name: "Sofia Reyes", type: "preset", source: "collection" },
  { id: "preset-luna-vale", name: "Luna Vale", type: "preset", source: "collection" },
  { id: "preset-lina-vale", name: "Lina Vale", type: "preset", source: "collection" },
{ id: "preset-aria-noir", name: "Aria Noir", type: "preset", source: "collection" },
{ id: "preset-sera-monroe", name: "Sera Monroe", type: "preset", source: "collection" },
];

const DEFAULT_PERSONA: ActivePersona = PRESET_PERSONAS[0];

const ACTIVE_PERSONA_KEY = "active_persona";
const PLAN_START_DATE_KEY = "plan_start_date";
const DEFAULT_REGION = "global";

const BASE_PLAN: PlanItem[] = [
  { day: "Day 1", title: "Gym routine reel", type: "Reel" },
  { day: "Day 3", title: "Protein recipe (quick)", type: "Short" },
  { day: "Day 5", title: "Motivation quote + CTA", type: "Story" },
  { day: "Day 7", title: "Transformation teaser", type: "Reel" },
  { day: "Day 10", title: "Behind the scenes", type: "Post" },
  { day: "Day 12", title: "Community Q&A", type: "Story" },
];


function formatCalendarTypeLabel(value: "story" | "reel" | "post"): string {
  if (value === "story") return "Story";
  if (value === "post") return "Post";
  return "Reel";
}

function mapCalendarRowsToPlan(rows: CalendarEntryRow[]): PlanItem[] {
  return rows
    .slice()
    .sort((a, b) => a.day_number - b.day_number)
    .map((row) => ({
      day: `Day ${row.day_number}`,
      title: row.title,
      type: formatCalendarTypeLabel(row.content_type),
      locked: false,
    }));
}

const SMART_CONTROL_CARDS: SmartControlCardConfig[] = [
  {
    key: "strategy",
    title: "Content Strategy",
    icon: "📈",
    emptyLabel: "Choose strategy",
    helper: "What should this content optimize for?",
  },
  {
    key: "look",
    title: "Visual Look",
    icon: "🎨",
    emptyLabel: "Choose look",
    helper: "How should the content feel visually?",
  },
  {
    key: "motion",
    title: "Motion Feel",
    icon: "🎬",
    emptyLabel: "Choose motion",
    helper: "How dynamic should the pacing feel?",
  },
  {
    key: "priorities",
    title: "Priority Stack",
    icon: "🎯",
    emptyLabel: "Choose priorities",
    helper: "What matters most in generation?",
  },
];

const SMART_CONTROL_OPTIONS: Record<SmartControlKey, SmartControlOption[]> = {
  strategy: [
    { label: "Viral Reach", value: "viral_reach", helper: "Maximize shareability and hooks" },
    { label: "Brand Safe", value: "brand_safe", helper: "Cleaner, more polished output" },
    { label: "Conversion", value: "conversion", helper: "Drive clicks, leads or purchases" },
    { label: "Community", value: "community", helper: "Encourage comments and saves" },
  ],
  look: [
    { label: "Luxury Realism", value: "luxury_realism", helper: "Premium but believable" },
    { label: "Phone Native", value: "phone_native", helper: "Raw social-first realism" },
    { label: "Clean Editorial", value: "clean_editorial", helper: "Polished but not fake" },
    { label: "Warm Lifestyle", value: "warm_lifestyle", helper: "Soft, human, everyday vibe" },
  ],
  motion: [
    { label: "Calm", value: "calm", helper: "Softer and slower feel" },
    { label: "Balanced", value: "balanced", helper: "Natural creator pacing" },
    { label: "Fast Hooky", value: "fast_hooky", helper: "High hook, quick social rhythm" },
    { label: "Cinematic Social", value: "cinematic_social", helper: "Stylish but still platform-native" },
  ],
  priorities: [
    { label: "Face Consistency", value: "face_consistency", helper: "Keep same identity first" },
    { label: "Realism", value: "realism", helper: "Avoid AI-looking output" },
    { label: "Hook Strength", value: "hook_strength", helper: "Stronger first impression" },
    { label: "Brand Match", value: "brand_match", helper: "Align with persona direction" },
    { label: "Conversion", value: "conversion", helper: "Push CTA or action" },
    { label: "Trend Fit", value: "trend_fit", helper: "Use current platform patterns" },
  ],
};

const DEFAULT_SMART_CONTROLS: SmartControlsState = {
  strategy: null,
  look: null,
  motion: null,
  priorities: [],
  customNote: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonthlyCycle(): number {
  if (typeof window === "undefined") return 0;

  const now = new Date();
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const stored = window.localStorage.getItem(PLAN_START_DATE_KEY);

  if (!stored) {
    window.localStorage.setItem(PLAN_START_DATE_KEY, String(todayMs));
    return 0;
  }

  const startMs = Number.parseInt(stored, 10);

  if (Number.isNaN(startMs)) {
    window.localStorage.setItem(PLAN_START_DATE_KEY, String(todayMs));
    return 0;
  }

  const daysSince = Math.floor((todayMs - startMs) / 86_400_000);

  if (daysSince >= 30) {
    window.localStorage.setItem(PLAN_START_DATE_KEY, String(todayMs));
    return 0;
  }

  return daysSince;
}

function isPlanDayUnlocked(dayLabel: string, daysSinceStart: number): boolean {
  const match = dayLabel.match(/Day\s+(\d+)/i);
  if (!match) return true;

  const dayNum = Number.parseInt(match[1], 10);
  if (dayNum <= 2) return true;

  return daysSinceStart >= dayNum - 1;
}

function getMergedPersonas(customPersonas: ActivePersona[]): ActivePersona[] {
  const seen = new Set<string>();
  const result: ActivePersona[] = [];

  for (const p of [...PRESET_PERSONAS, ...customPersonas]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      result.push(p);
    }
  }

  return result;
}

function getActivePersona(allPersonas: ActivePersona[]): ActivePersona {
  if (typeof window === "undefined") return DEFAULT_PERSONA;

  try {
    const raw = window.localStorage.getItem(ACTIVE_PERSONA_KEY);
    if (!raw) return DEFAULT_PERSONA;

    const parsed = JSON.parse(raw) as ActivePersona;
    return allPersonas.find((p) => p.id === parsed.id) ?? DEFAULT_PERSONA;
  } catch {
    return DEFAULT_PERSONA;
  }
}

function getPlanAccess(planId: string): {
  canCreatePersona: boolean;
  canUseAdvancedControls: boolean;
} {
  const id = planId.toLowerCase();
  const canUseAdvancedControls = id.includes("creator") || id.includes("agency");

  return {
    canCreatePersona: canUseAdvancedControls,
    canUseAdvancedControls,
  };
}

function getUpgradeTargetForSmartCard(
  key: "look" | "motion" | "strategy" | "priorities"
): {
  plan: "pro" | "creator" | "agency";
  title: string;
  message: string;
} {
  if (key === "look") {
    return {
      plan: "pro",
      title: "Unlock Visual Look",
      message: "Upgrade to Pro to control the visual vibe of your content.",
    };
  }

  if (key === "motion") {
    return {
      plan: "pro",
      title: "Unlock Motion Feel",
      message: "Upgrade to Pro to control pacing, energy, and creator-style motion.",
    };
  }

  if (key === "strategy") {
    return {
      plan: "creator",
      title: "Unlock Strategy Controls",
      message:
        "Upgrade to Creator to shape output around virality, conversion, community, and brand safety.",
    };
  }

  return {
    plan: "creator",
    title: "Unlock Priority Stack",
    message:
      "Upgrade to Creator to control what the model prioritizes most, like face consistency and realism.",
  };
}

function getCurrentUsageMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function buildContentUsageFromDb(
  plan: ResolvedPlan,
  usageRow?: {
    videos_used?: number | null;
    stories_used?: number | null;
    posts_used?: number | null;
  } | null
): ContentUsage {
  return {
    video: {
      used: usageRow?.videos_used ?? 0,
      limit: plan.limits.video,
    },
    story: {
      used: usageRow?.stories_used ?? 0,
      limit: plan.limits.story,
    },
    post: {
      used: usageRow?.posts_used ?? 0,
      limit: plan.limits.post,
    },
  };
}

function getPreviewAspectRatio(format?: GeneratedFormat): string {
  if (format === "post") return "1 / 1";
  if (format === "story") return "9 / 16";
  return "9 / 16";
}

function getPreviewMaxWidth(format?: GeneratedFormat): number {
  if (format === "post") return 320;
  return 260;
}

function getGeneratedLabel(format?: GeneratedFormat): string {
  if (format === "post") return "Generated Post";
  if (format === "story") return "Generated Story";
  return "Generated Reel";
}

function getGeneratedCtaLabel(format?: GeneratedFormat): string {
  if (format === "post" || format === "story") return "Open Image →";
  return "Open Video →";
}

function getConceptTypeLabel(type: string): "reel" | "story" | "post" | null {
  const normalized = type.toLowerCase();

  if (normalized.includes("reel") || normalized.includes("short")) return "reel";
  if (normalized.includes("story")) return "story";
  if (normalized.includes("post")) return "post";

  return null;
}

function getSmartControlSummary(
  key: SmartControlKey,
  value: string | string[] | null
): string {
  if (key === "priorities") {
    const arr = Array.isArray(value) ? value : [];
    if (arr.length === 0) return "Choose priorities";
    if (arr.length === 1) {
      return (
        SMART_CONTROL_OPTIONS.priorities.find((x) => x.value === arr[0])?.label ??
        arr[0]
      );
    }
    return `${arr.length} priorities selected`;
  }

  const str = typeof value === "string" ? value : null;
  if (!str) {
    return SMART_CONTROL_CARDS.find((x) => x.key === key)?.emptyLabel ?? "Choose";
  }

  return SMART_CONTROL_OPTIONS[key].find((x) => x.value === str)?.label ?? str;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanRow({ item }: { item: PlanItem }) {
  const typeStyle =
    TYPE_STYLES[item.type] ?? {
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.12)",
      color: "rgba(255,255,255,.70)",
    };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 16,
        background: item.locked ? "rgba(255,255,255,.015)" : "rgba(255,255,255,.04)",
        border: item.locked
          ? "1px solid rgba(255,255,255,.05)"
          : "1px solid rgba(255,255,255,.08)",
        opacity: item.locked ? 0.44 : 1,
      }}
    >
      <div
        style={{
          flex: "0 0 46px",
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,255,255,.58)",
          letterSpacing: 0.2,
        }}
      >
        {item.day}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "rgba(255,255,255,.88)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={item.title}
        >
          {item.locked ? "🔒 Locked" : item.title}
        </div>

        {!item.locked && (
          <div style={{ marginTop: 3, fontSize: 11, color: "rgba(255,255,255,.36)" }}>
            Auto-planned · editable
          </div>
        )}
      </div>

      <div
        style={{
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.2,
          flexShrink: 0,
          ...typeStyle,
        }}
      >
        {item.type}
      </div>
    </div>
  );
}

function UsageLimitCard({ usage }: { usage: ContentUsage }) {
  const rows: { label: string; icon: string; used: number; limit: number }[] = [
    { label: "Video", icon: "🎬", used: usage.video.used, limit: usage.video.limit },
    { label: "Post", icon: "📝", used: usage.post.used, limit: usage.post.limit },
    { label: "Story", icon: "✨", used: usage.story.used, limit: usage.story.limit },
  ];

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "12px 14px",
        background: "rgba(0,0,0,.20)",
        border: "1px solid rgba(255,255,255,.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 1.6,
          color: "rgba(255,255,255,.30)",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Monthly Usage
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map(({ label, icon, used, limit }) => {
          const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
          const isExhausted = limit > 0 && used >= limit;

          return (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 50px",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: 12 }}>{icon}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.60)",
                  }}
                >
                  {label}
                </span>
              </div>

              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 999,
                    background: isExhausted
                      ? "linear-gradient(90deg,rgba(239,68,68,.75),rgba(239,68,68,.55))"
                      : "linear-gradient(90deg,rgba(168,85,247,.75),rgba(236,72,153,.60))",
                    transition: "width 300ms ease",
                  }}
                />
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontSize: 11,
                  fontWeight: 800,
                  color: isExhausted
                    ? "rgba(239,68,68,.85)"
                    : "rgba(255,255,255,.52)",
                }}
              >
                {used}/{limit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OnDemandPanel({
  singlePrice,
  packPrice,
}: {
  singlePrice: number;
  packPrice: number;
}) {
  const fmtUsd = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "14px 14px",
        background:
          "linear-gradient(135deg,rgba(168,85,247,.08),rgba(236,72,153,.06))",
        border: "1px solid rgba(168,85,247,.18)",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: "rgba(239,68,68,.14)",
            border: "1px solid rgba(239,68,68,.22)",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          🎬
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "rgba(255,255,255,.88)",
              lineHeight: 1.2,
            }}
          >
            You're out of videos
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,.38)",
              marginTop: 2,
            }}
          >
            Buy extra to keep generating this month
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => console.log("buy 1")}
          style={{
            flex: 1,
            padding: "11px 10px",
            borderRadius: 12,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.10)",
            color: "rgba(255,255,255,.82)",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, marginBottom: 2 }}>Buy 1</div>
          <div
            style={{
              color: "rgba(168,85,247,.90)",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {fmtUsd(singlePrice)}
          </div>
        </button>
        <button
          type="button"
          onClick={() => console.log("buy 5")}
          style={{
            flex: 1,
            padding: "11px 10px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg,rgba(168,85,247,.16),rgba(236,72,153,.12))",
            border: "1px solid rgba(168,85,247,.28)",
            color: "rgba(255,255,255,.92)",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            lineHeight: 1.4,
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              background:
                "linear-gradient(135deg,rgba(168,85,247,.90),rgba(236,72,153,.80))",
              borderRadius: 999,
              padding: "2px 8px",
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 0.8,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            BEST VALUE
          </div>
          <div style={{ fontSize: 13, marginBottom: 2 }}>Buy 5</div>
          <div
            style={{
              color: "rgba(220,170,255,.95)",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {fmtUsd(packPrice)}
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";

export default function StudioPage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const tabs = useMemo(
    () =>
      [
        { key: "calendar" as const, label: "30 Days" },
        { key: "notes" as const, label: "Advanced Notes" },
        { key: "brand" as const, label: "Brand Direction" },
      ] as const,
    []
  );

  const [tab, setTab] = useState<TabKey>("calendar");
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<"reel" | "story" | "post">("reel");
const [identityLock, setIdentityLock] = useState(true);
const [allureMode, setAllureMode] = useState(false);

  const [plan, setPlan] = useState<PlanItem[]>(
    BASE_PLAN.map((item) => ({ ...item, locked: true }))
  );
  const [calendarRows, setCalendarRows] = useState<CalendarEntryRow[]>([]);

  const [generated, setGenerated] = useState<GeneratedResult | null>(null);
  const [usageInfo, setUsageInfo] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

const [activeJobId, setActiveJobId] = useState<string | null>(null);
const [jobStatus, setJobStatus] = useState<
  "queued" | "processing" | "completed" | "failed" | null
>(null);

  const [userPlan, setUserPlan] = useState<ResolvedPlan | null>(null);
  const [selectedBoost, setSelectedBoost] = useState<"allure" | "consistency" | null>(null);
  const [freeAllureRemaining, setFreeAllureRemaining] = useState(0);
  const [freeConsistencyRemaining, setFreeConsistencyRemaining] = useState(0);
  const [reelDuration, setReelDuration] = useState<5 | 10 | 15>(10);
  const [contentUsage, setContentUsage] = useState<ContentUsage | null>(null);

  const [customPersonas, setCustomPersonas] = useState<ActivePersona[]>([]);
  const [activePersona, setActivePersona] = useState<ActivePersona>(DEFAULT_PERSONA);

  const [advancedNotes, setAdvancedNotes] = useState("");
  const [brandDirection, setBrandDirection] = useState("");
  const [brandKeywords, setBrandKeywords] = useState("");
  const [visualDoNotUse, setVisualDoNotUse] = useState("");
  const [personaNiche, setPersonaNiche] = useState<string | null>(null);

  const [savingPersonaMeta, setSavingPersonaMeta] = useState(false);
  const [personaMetaMessage, setPersonaMetaMessage] = useState<string | null>(null);

  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [canCreatePersona, setCanCreatePersona] = useState(false);
  const [canUseAdvancedControls, setCanUseAdvancedControls] = useState(false);
  const [personaLoading, setPersonaLoading] = useState(true);

const [smartAccess, setSmartAccess] = useState({
  canUseLook: false,
  canUseMotion: false,
  canUseStrategy: false,
  canUsePriorities: false,
  canUseCustomNote: false,
  canSavePresets: false,
});

  const [smartControls, setSmartControls] =
    useState<SmartControlsState>(DEFAULT_SMART_CONTROLS);
  const [openSmartControl, setOpenSmartControl] =
    useState<SmartControlKey | null>(null);

  const personaDropdownRef = useRef<HTMLDivElement>(null);

  const mergedPersonas = useMemo(
    () => getMergedPersonas(customPersonas),
    [customPersonas]
  );

  const activeIndex = tabs.findIndex((t) => t.key === tab);

  const currentRemaining = contentUsage
    ? contentType === "post"
      ? contentUsage.post.limit - contentUsage.post.used
      : contentType === "story"
      ? contentUsage.story.limit - contentUsage.story.used
      : contentUsage.video.limit - contentUsage.video.used
    : usageInfo
    ? usageInfo.remaining
    : null;

  const isCurrentLimitReached = currentRemaining !== null && currentRemaining <= 0;

  const canBuyOnDemand =
    contentType === "reel" &&
    isCurrentLimitReached &&
    (userPlan?.onDemand.enabled ?? false);

  const matchedPlanItem = useMemo(() => {
    const unlockedItems = plan.filter((item) => !item.locked);
    const exactTypeMatches = unlockedItems.filter((item) => {
      const mapped = getConceptTypeLabel(item.type);
      return mapped === contentType;
    });

    if (exactTypeMatches.length > 0) {
      return exactTypeMatches[exactTypeMatches.length - 1];
    }

    if (contentType === "reel") {
      const reelFriendlyFallback = unlockedItems.filter((item) => {
        const mapped = getConceptTypeLabel(item.type);
        return mapped === "reel";
      });

      if (reelFriendlyFallback.length > 0) {
        return reelFriendlyFallback[reelFriendlyFallback.length - 1];
      }
    }

    return unlockedItems.length > 0 ? unlockedItems[unlockedItems.length - 1] : null;
  }, [plan, contentType]);

  function getButtonLabel(): string {
if (activeJobId && (jobStatus === "queued" || jobStatus === "processing")) {
  return jobStatus === "queued" ? "Reel queued..." : "Generating reel...";
}  

  const contentLabel =
      contentType === "story" ? "Story" : contentType === "post" ? "Post" : "Reel";

    if (loading) return "Generating...";

    if (currentRemaining === null) {
      return `✦ Generate ${contentLabel} for ${activePersona.name}`;
    }

    if (contentType === "reel" && currentRemaining <= 0 && canBuyOnDemand) {
      const price = userPlan?.onDemand.extraVideoPriceUsd ?? 0;
      return `Buy extra video ($${price.toFixed(2)})`;
    }

    if (currentRemaining <= 0) {
      return `${contentLabel} limit reached`;
    }

    return `✦ Generate ${contentLabel} (${currentRemaining} left)`;
  }

  function togglePriority(value: string) {
    setSmartControls((prev) => {
      const exists = prev.priorities.includes(value);

      return {
        ...prev,
        priorities: exists
          ? prev.priorities.filter((item) => item !== value)
          : [...prev.priorities, value],
      };
    });
  }

  function setSingleSmartControl(key: "strategy" | "look" | "motion", value: string) {
    setSmartControls((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  function resetSmartControls() {
    setSmartControls(DEFAULT_SMART_CONTROLS);
    setOpenSmartControl(null);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash.replace("#", "") as TabKey;
    if (h === "calendar" || h === "notes" || h === "brand") setTab(h);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.location.hash = tab;
  }, [tab]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setPersonaLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let fetched: ActivePersona[] = [];

        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("current_plan_id")
            .eq("user_id", user.id)
            .single();

const planId: string = profile?.current_plan_id ?? "";
const access = getPlanAccess(planId);

if (!cancelled) {
  setCanCreatePersona(access.canCreatePersona);
  setCanUseAdvancedControls(access.canUseAdvancedControls);

  setSmartAccess({
    canUseLook:
      planId.toLowerCase().includes("pro") ||
      planId.toLowerCase().includes("creator") ||
      planId.toLowerCase().includes("agency"),
    canUseMotion:
      planId.toLowerCase().includes("pro") ||
      planId.toLowerCase().includes("creator") ||
      planId.toLowerCase().includes("agency"),
    canUseStrategy:
      planId.toLowerCase().includes("creator") ||
      planId.toLowerCase().includes("agency"),
    canUsePriorities:
      planId.toLowerCase().includes("creator") ||
      planId.toLowerCase().includes("agency"),
    canUseCustomNote:
      planId.toLowerCase().includes("creator") ||
      planId.toLowerCase().includes("agency"),
    canSavePresets: planId.toLowerCase().includes("agency"),
  });
}

          const resolved = resolvePlan(planId) as ResolvedPlan | null;

          if (resolved) {
            const usageMonth = getCurrentUsageMonth();

            const { data: usageRow } = await supabase
              .from("content_usage")
              .select("videos_used, stories_used, posts_used")
              .eq("user_id", user.id)
              .eq("usage_month", usageMonth)
              .maybeSingle();

            if (!cancelled) {
              setUserPlan(resolved);
              setContentUsage(buildContentUsageFromDb(resolved, usageRow));
            }
          }

          const { data: rows, error } = await supabase
            .from("personas")
            .select("id, name")
            .eq("user_id", user.id);

          if (!error && rows && !cancelled) {
            fetched = rows.map((r: { id: string; name: string }) => ({
              id: r.id,
              name: r.name,
              type: "custom" as const,
              source: "custom",
            }));
          }
        }

        if (!cancelled) {
          setCustomPersonas(fetched);
          const merged = getMergedPersonas(fetched);
          setActivePersona(getActivePersona(merged));
        }
      } catch (err) {
        console.error("[Studio] Init error:", err);
        if (!cancelled) {
          setActivePersona(getActivePersona(PRESET_PERSONAS));
        }
      } finally {
        if (!cancelled) {
          setPersonaLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function loadPersonaMeta() {
      setPersonaMetaMessage(null);

      if (activePersona.type !== "custom") {
        setAdvancedNotes("");
        setBrandDirection("");
        setBrandKeywords("");
        setVisualDoNotUse("");
        setPersonaNiche(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("personas")
          .select(
            "advanced_prompt_notes, brand_direction, brand_keywords, visual_do_not_use, niche"
          )
          .eq("id", activePersona.id)
          .maybeSingle();

        if (error) throw error;

        const row = data as PersonaMetaRow | null;

        if (!cancelled) {
          setAdvancedNotes(row?.advanced_prompt_notes ?? "");
          setBrandDirection(row?.brand_direction ?? "");
          setBrandKeywords(row?.brand_keywords ?? "");
          setVisualDoNotUse(row?.visual_do_not_use ?? "");
          setPersonaNiche(row?.niche ?? null);
        }
      } catch (err) {
        console.error("[Studio] loadPersonaMeta error:", err);
        if (!cancelled) {
          setAdvancedNotes("");
          setBrandDirection("");
          setBrandKeywords("");
          setVisualDoNotUse("");
          setPersonaNiche(null);
        }
      }
    }

    void loadPersonaMeta();

    return () => {
      cancelled = true;
    };
  }, [activePersona.id, activePersona.type, supabase]);

  useEffect(() => {
    const daysSince = getCurrentMonthlyCycle();

    const computed = BASE_PLAN.map((item) => ({
      ...item,
      locked: !isPlanDayUnlocked(item.day, daysSince),
    }));

    setPlan(computed);
  }, []);

  useEffect(() => {
    if (!showPersonaDropdown) return;

    function onOutside(e: MouseEvent) {
      if (
        personaDropdownRef.current &&
        !personaDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPersonaDropdown(false);
      }
    }

    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [showPersonaDropdown]);

useEffect(() => {
  let cancelled = false;

  async function restoreActiveJob() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const res = await fetch(
        `/api/generate/job/latest?userId=${encodeURIComponent(user.id)}`
      );

      const data = await res.json();

      if (cancelled) return;

      if (!res.ok || !data.success || !data.job) {
        setActiveJobId(null);
        setJobStatus(null);
        return;
      }

      if (data.job.status === "queued" || data.job.status === "processing") {
        setActiveJobId(data.job.id);
        setJobStatus(data.job.status);
        return;
      }

      setActiveJobId(null);
      setJobStatus(null);
    } catch (err) {
      console.error("RESTORE ACTIVE JOB ERROR", err);
      if (!cancelled) {
        setActiveJobId(null);
        setJobStatus(null);
      }
    }
  }

  void restoreActiveJob();

  return () => {
    cancelled = true;
  };
}, [supabase]);

useEffect(() => {
  if (!activeJobId) return;

  let cancelled = false;

  async function pollJob() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

const res = await fetch(
`/api/generate/job?jobId=${encodeURIComponent(
  activeJobId ?? ""
)}&userId=${encodeURIComponent(user.id)}`
);

      const data: JobStatusResponse = await res.json();

      if (!res.ok || !data.success) {
        return;
      }

      if (cancelled) return;

      setJobStatus(data.job.status);

if (data.job.status !== "queued" && data.job.status !== "processing") {
  setActiveJobId(null);
}

      if (data.job.status === "completed" && data.job.video_url) {
        setGenerated({
          title: data.job.title ?? "Generated Reel",
          caption: data.job.caption ?? "",
          video_url: data.job.video_url,
          thumbnail_url: data.job.thumbnail_url ?? data.job.image_url ?? "",
          format: "reel",
        });
        setGenerateError(null);
        setActiveJobId(null);
        setJobStatus("completed");
      }

      if (data.job.status === "failed") {
        setGenerateError(
          data.job.error_message ?? "Reel generation failed."
        );
        setActiveJobId(null);
        setJobStatus("failed");
      }
    } catch (err) {
      console.error("JOB POLL ERROR", err);
    }
  }

  void pollJob();

  const interval = setInterval(() => {
    void pollJob();
  }, 5000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [activeJobId, supabase]);

function selectPersona(persona: ActivePersona) {
  setActivePersona(persona);
  setShowPersonaDropdown(false);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_PERSONA_KEY, JSON.stringify(persona));
  }
}

  async function handleSavePersonaMeta() {
    setPersonaMetaMessage(null);

    if (!canUseAdvancedControls) {
      setPersonaMetaMessage("Advanced Notes and Brand Direction require Creator or Agency.");
      return;
    }

    if (activePersona.type !== "custom") {
      setPersonaMetaMessage("Only custom personas can save persona-level notes.");
      return;
    }

    try {
      setSavingPersonaMeta(true);

      const { error } = await supabase
        .from("personas")
        .update({
          advanced_prompt_notes: advancedNotes.trim() || null,
          brand_direction: brandDirection.trim() || null,
          brand_keywords: brandKeywords.trim() || null,
          visual_do_not_use: visualDoNotUse.trim() || null,
        })
        .eq("id", activePersona.id);

      if (error) throw error;

      setPersonaMetaMessage("Saved.");
    } catch (err) {
      setPersonaMetaMessage(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSavingPersonaMeta(false);
    }
  }

  const generatePlan = async () => {
    if (userPlan && isCurrentLimitReached) {
      setGenerateError(
        contentType === "reel"
          ? "Reel limit reached."
          : contentType === "story"
          ? "Story limit reached."
          : "Post limit reached."
      );
      return;
    }

    try {
      setLoading(true);
      setGenerateError(null);

      const persona = activePersona ?? DEFAULT_PERSONA;

console.log("GENERATE BODY", {
  personaId: persona.id,
  contentType,
  shotPresetId:
    contentType === "post"
      ? "soft_smile_closeup"
      : contentType === "story"
      ? "talking_selfie"
      : "talking_selfie",
});

const res = await fetch("/api/generate", {
  method: "POST",
headers: {
  "Content-Type": "application/json",
},
  body: JSON.stringify({
    personaId: persona.id,
    personaName: persona.name,
    personaType: persona.type,
    contentType,
    shotPresetId:
      contentType === "post"
        ? "soft_smile_closeup"
        : contentType === "story"
        ? "talking_selfie"
        : "talking_selfie",
    planTitle: matchedPlanItem?.title ?? null,
    planDay: matchedPlanItem?.day ?? null,
    planType: matchedPlanItem?.type ?? null,
    niche: personaNiche ?? null,
    region: DEFAULT_REGION,
    smartControls,
    faceImageUrl:
      (persona as any).face_image_url ??
      (persona as any).cover_image_url ??
      "",
    coverImageUrl: (persona as any).cover_image_url ?? "",
    references: Array.isArray((persona as any).references)
      ? (persona as any).references
      : [],
    identityLock,
    allureMode,
    allureBoost: selectedBoost === "allure",
    extraConsistency: selectedBoost === "consistency",
    durationSeconds: contentType === "reel" ? getSafeReelDuration(selectedBoost, reelDuration) : null
}),
});

const rawText = await res.text();
console.log("GENERATE RAW STATUS", res.status);
console.log("GENERATE RAW TEXT", rawText);

let data: GenerateResponse;
try {
  data = JSON.parse(rawText) as GenerateResponse;
} catch (parseError) {
  console.error("GENERATE JSON PARSE ERROR", parseError);
  throw new Error(`Failed to parse API response: ${rawText}`);
}

console.log("GENERATE PARSED DATA", data);

if (!res.ok || !data.success) {
  setGenerated(null);
  setGenerateError(
    data.success === false
      ? data.message
      : "Something went wrong during generation."
  );
  return;
}

if (data.mode === "async_reel" && data.jobId) {
  setActiveJobId(data.jobId);
  setJobStatus(data.status ?? "queued");
  setGenerated(null);
} else if (data.content) {
  setGenerated(data.content);
  setActiveJobId(null);
  setJobStatus(null);
}

setUsageInfo(data.usage);

      setContentUsage((prev) => {
        if (!prev) return prev;

        if (data.usageType === "post") {
          return {
            ...prev,
            post: {
              used: data.usage.used,
              limit: data.usage.limit,
            },
          };
        }

        if (data.usageType === "story") {
          return {
            ...prev,
            story: {
              used: data.usage.used,
              limit: data.usage.limit,
            },
          };
        }

        return {
          ...prev,
          video: {
            used: data.usage.used,
            limit: data.usage.limit,
          },
        };
      });
} catch (e) {
  console.error("GENERATE FRONTEND ERROR", e);
  setGenerateError(
    e instanceof Error ? e.message : "Unexpected error while generating content."
  );
} finally {
  setLoading(false);
}
  };

  function handleBuyOnDemand() {
    if (!userPlan?.onDemand.enabled) return;
    console.log("buy");
  }

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
            gap: 12,
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
              STUDIO
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "rgba(255,255,255,.44)",
              }}
            >
              Active:

              <div ref={personaDropdownRef} style={{ position: "relative" }}>
                <span
                  onClick={() => !personaLoading && setShowPersonaDropdown((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg,rgba(168,85,247,.15),rgba(236,72,153,.10))",
                    border: "1px solid rgba(168,85,247,.25)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.85)",
                    cursor: personaLoading ? "default" : "pointer",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#A855F7,#ec4899)",
                      boxShadow: "0 0 6px rgba(168,85,247,.8)",
                    }}
                  />
                  {personaLoading ? "Loading..." : activePersona.name}

{!personaLoading && activePersona.source === "discover" && (
  <span
    style={{
      marginLeft: 8,
      padding: "4px 8px",
      borderRadius: 999,
      background: "rgba(168,85,247,.14)",
      border: "1px solid rgba(168,85,247,.24)",
      color: "rgba(245,208,254,.95)",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 0.4,
      whiteSpace: "nowrap",
    }}
  >
    FROM DISCOVER
  </span>
)}
                </span>

{!personaLoading && activePersona.source === "discover" && (
  <div
    style={{
      marginTop: 10,
      borderRadius: 14,
      padding: "10px 12px",
      background: "rgba(168,85,247,.10)",
      border: "1px solid rgba(168,85,247,.20)",
      color: "rgba(255,255,255,.86)",
      fontSize: 12,
      lineHeight: 1.5,
    }}
  >
    Selected from Discover. This preset model is currently active in Studio.
  </div>
)}

                {showPersonaDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      zIndex: 100,
                      minWidth: 210,
                      borderRadius: 14,
                      background: "rgba(14,8,26,.97)",
                      border: "1px solid rgba(168,85,247,.25)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 20px 50px rgba(0,0,0,.65)",
                      overflow: "hidden",
                      padding: "6px 0",
                    }}
                  >
                    <div
                      style={{
                        padding: "4px 12px 3px",
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: 1.5,
                        color: "rgba(255,255,255,.28)",
                        textTransform: "uppercase",
                      }}
                    >
                      Collection
                    </div>

{PRESET_PERSONAS.map((p) => (
                      <div
                        key={p.id}
                        role="button"
                        tabIndex={0}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectPersona(p);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectPersona(p);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectPersona(p);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            selectPersona(p);
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "9px 14px",
                          background:
                            activePersona.id === p.id
                              ? "rgba(168,85,247,.14)"
                              : "transparent",
                          color:
                            activePersona.id === p.id
                              ? "rgba(200,150,255,.95)"
                              : "rgba(255,255,255,.72)",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "inherit",
                          touchAction: "manipulation",
                          WebkitTapHighlightColor: "transparent",
                          position: "relative",
                          zIndex: 20,
                          pointerEvents: "auto",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#A855F7,#ec4899)",
                            flexShrink: 0,
                          }}
                        />
                        {p.name}
                      </div>
                    ))}

                    {customPersonas.length > 0 && (
                      <>
                        <div
                          style={{
                            height: 1,
                            background: "rgba(255,255,255,.07)",
                            margin: "4px 0",
                          }}
                        />
                        <div
                          style={{
                            padding: "4px 12px 3px",
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: 1.5,
                            color: "rgba(255,255,255,.28)",
                            textTransform: "uppercase",
                          }}
                        >
                          My Personas
                        </div>

                        {mergedPersonas
                          .filter((p) => p.type === "custom")
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => selectPersona(p)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                width: "100%",
                                padding: "9px 14px",
                                background:
                                  activePersona.id === p.id
                                    ? "rgba(99,102,241,.14)"
                                    : "transparent",
                                border: "none",
                                color:
                                  activePersona.id === p.id
                                    ? "rgba(160,165,255,.95)"
                                    : "rgba(255,255,255,.72)",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                              }}
                            >
                              <div
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg,#6366f1,#3b82f6)",
                                  flexShrink: 0,
                                }}
                              />
                              {p.name}
                            </button>
                          ))}
                      </>
                    )}

                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,.07)",
                        margin: "4px 0",
                      }}
                    />

                    <button
                      type="button"
                      disabled={!canCreatePersona}
                      onClick={() => {
                        setShowPersonaDropdown(false);
                        if (canCreatePersona) {
                          window.location.href = "/persona/create";
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "9px 14px",
                        background: "transparent",
                        border: "none",
                        color: canCreatePersona
                          ? "rgba(168,85,247,.90)"
                          : "rgba(255,255,255,.24)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: canCreatePersona ? "pointer" : "not-allowed",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                    >
                      {canCreatePersona
                        ? "＋ Create Persona"
                        : "🔒 Create Persona (Upgrade)"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/collection";
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.10)",
              color: "rgba(255,255,255,.80)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 12px 30px rgba(0,0,0,.30)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.2,
              fontFamily: "inherit",
            }}
          >
            Collection
          </button>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            padding: 5,
            borderRadius: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow:
              "0 20px 50px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.05)",
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              width: "calc((100% - 10px) / 3)",
              height: "calc(100% - 10px)",
              transform: `translateX(${activeIndex * 100}%)`,
              transition: "transform 280ms cubic-bezier(.2,.9,.2,1)",
              borderRadius: 14,
              background: GRAD,
              opacity: 0.9,
              boxShadow: "0 14px 40px rgba(0,0,0,.30)",
            }}
          />

          {tabs.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={{
                  position: "relative",
                  zIndex: 2,
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  color: isActive
                    ? "rgba(255,255,255,.96)"
                    : "rgba(255,255,255,.50)",
                  padding: "11px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  fontFamily: "inherit",
                  transition: "color 220ms ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            borderRadius: 24,
            padding: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "rgba(255,255,255,.95)",
              letterSpacing: 0.2,
              marginBottom: 5,
            }}
          >
            {tab === "calendar"
              ? "Monthly Content Calendar"
              : tab === "notes"
              ? "Advanced Notes"
              : "Brand Direction"}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.40)",
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {tab === "calendar"
              ? "Your AI-optimised content schedule"
              : tab === "notes"
              ? "Persona-specific advanced prompting notes and generation guidance"
              : "Brand rules, keywords, vibe and visual boundaries"}
          </div>

          {tab === "calendar" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {SMART_CONTROL_CARDS.map((card) => {
                  const currentValue =
                    card.key === "priorities"
                      ? smartControls.priorities
                      : smartControls[card.key];

                  const summary = getSmartControlSummary(card.key, currentValue);
                  const isOpen = openSmartControl === card.key;
const locked =
  (card.key === "look" && !smartAccess.canUseLook) ||
  (card.key === "motion" && !smartAccess.canUseMotion) ||
  (card.key === "strategy" && !smartAccess.canUseStrategy) ||
  (card.key === "priorities" && !smartAccess.canUsePriorities);

                  return (
                    <button
                      key={card.key}
                      type="button"
onClick={() => {
const locked =
  (card.key === "look" && !smartAccess.canUseLook) ||
  (card.key === "motion" && !smartAccess.canUseMotion) ||
  (card.key === "strategy" && !smartAccess.canUseStrategy) ||
  (card.key === "priorities" && !smartAccess.canUsePriorities);

  if (locked) {
    const target = getUpgradeTargetForSmartCard(card.key);
window.location.href = `/plans?focus=${target.plan}`;
    return;
  }

  setOpenSmartControl(isOpen ? null : card.key);
}}
                      style={{
                        textAlign: "left",
                        borderRadius: 18,
                        padding: 14,
background: locked
  ? "rgba(255,255,255,.025)"
  : isOpen
  ? "linear-gradient(135deg,rgba(168,85,247,.14),rgba(236,72,153,.08))"
  : "rgba(255,255,255,.04)",
border: locked
  ? "1px solid rgba(255,255,255,.06)"
  : isOpen
  ? "1px solid rgba(168,85,247,.26)"
  : "1px solid rgba(255,255,255,.08)",
opacity: locked ? 0.72 : 1,
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,.06),0 12px 30px rgba(0,0,0,.30)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            display: "grid",
                            placeItems: "center",
                            background:
                              "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.12))",
                            border: "1px solid rgba(168,85,247,.20)",
                            fontSize: 15,
                          }}
                        >
                          {card.icon}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,.55)",
                            fontWeight: 600,
                          }}
                        >
                          {card.title}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "rgba(255,255,255,.94)",
                          letterSpacing: 0.2,
                          lineHeight: 1.15,
                        }}
                      >
{locked ? "Locked" : summary}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 11,
                          color: "rgba(255,255,255,.38)",
                        }}
                      >
{locked ? "Tap to view upgrade options" : card.helper}
                      </div>
                    </button>
                  );
                })}
              </div>

              {openSmartControl && (
                <div
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    background: "rgba(0,0,0,.22)",
                    border: "1px solid rgba(255,255,255,.07)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "rgba(255,255,255,.88)",
                        }}
                      >
                        {SMART_CONTROL_CARDS.find((item) => item.key === openSmartControl)?.title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,.40)",
                          marginTop: 3,
                          lineHeight: 1.5,
                        }}
                      >
                        {SMART_CONTROL_CARDS.find((item) => item.key === openSmartControl)?.helper}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenSmartControl(null)}
                      style={{
                        border: "none",
                        background: "rgba(255,255,255,.05)",
                        color: "rgba(255,255,255,.70)",
                        borderRadius: 999,
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "inherit",
                      }}
                    >
                      Close
                    </button>
                  </div>

                  {openSmartControl !== "priorities" && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {SMART_CONTROL_OPTIONS[openSmartControl].map((option) => {
                        const selected =
                          openSmartControl === "strategy" ||
                          openSmartControl === "look" ||
                          openSmartControl === "motion"
                            ? smartControls[openSmartControl] === option.value
                            : false;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setSingleSmartControl(
                                openSmartControl as "strategy" | "look" | "motion",
                                option.value
                              )
                            }
                            style={{
                              padding: "9px 12px",
                              borderRadius: 999,
                              border: selected
                                ? "1px solid rgba(168,85,247,.45)"
                                : "1px solid rgba(255,255,255,.10)",
                              background: selected
                                ? "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.12))"
                                : "rgba(255,255,255,.04)",
                              color: selected
                                ? "rgba(255,255,255,.94)"
                                : "rgba(255,255,255,.58)",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {openSmartControl === "priorities" && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {SMART_CONTROL_OPTIONS.priorities.map((option) => {
                        const selected = smartControls.priorities.includes(option.value);

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => togglePriority(option.value)}
                            style={{
                              padding: "9px 12px",
                              borderRadius: 999,
                              border: selected
                                ? "1px solid rgba(168,85,247,.45)"
                                : "1px solid rgba(255,255,255,.10)",
                              background: selected
                                ? "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.12))"
                                : "rgba(255,255,255,.04)",
                              color: selected
                                ? "rgba(255,255,255,.94)"
                                : "rgba(255,255,255,.58)",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ marginTop: 14 }}>
                    <textarea
                      value={smartControls.customNote}
                      onChange={(e) =>
                        setSmartControls((prev) => ({
                          ...prev,
                          customNote: e.target.value,
                        }))
                      }
                      placeholder="Example: Keep it highly realistic, confident, luxury nightlife energy, phone-native framing, subtle imperfections, strongest face consistency."
                      style={{
                        width: "100%",
                        minHeight: 110,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,.08)",
                        background: "rgba(255,255,255,.03)",
                        color: "rgba(255,255,255,.92)",
                        padding: "14px",
                        fontSize: 13,
                        lineHeight: 1.6,
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: "rgba(255,255,255,.40)",
                        lineHeight: 1.5,
                      }}
                    >
                      Add a very specific generation note for this one output.
                    </div>
                  </div>

<div
  style={{
    marginTop: 14,
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.08)",
    display: "grid",
    gap: 12,
  }}
>
  <label
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      cursor: "pointer",
    }}
  >
    <div>
      <div
        style={{
          color: "rgba(255,255,255,.95)",
          fontSize: 13,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Identity Lock
      </div>
      <div
        style={{
          color: "rgba(255,255,255,.56)",
          fontSize: 12,
          lineHeight: 1.35,
        }}
      >
        Keep the same face closely
      </div>
    </div>

    <input
      type="checkbox"
      checked={identityLock}
      onChange={(e) => setIdentityLock(e.target.checked)}
      style={{ marginTop: 2 }}
    />
  </label>

  <label
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      cursor: "pointer",
    }}
  >
    <div>
      <div
        style={{
          color: "rgba(255,255,255,.95)",
          fontSize: 13,
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Allure Mode
      </div>
      <div
        style={{
          color: "rgba(255,255,255,.56)",
          fontSize: 12,
          lineHeight: 1.35,
        }}
      >
        More premium, magnetic look
      </div>
      {allureMode && !identityLock && (
        <div
          style={{
            color: "rgba(236,72,153,.9)",
            fontSize: 11,
            marginTop: 6,
            fontWeight: 700,
          }}
        >
          Best results with Identity Lock on.
        </div>
      )}
    </div>

    <input
      type="checkbox"
      checked={allureMode}
      onChange={(e) => setAllureMode(e.target.checked)}
      style={{ marginTop: 2 }}
    />
  </label>
</div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,.38)",
                      }}
                    >
                      These selections shape the next generated output.
                    </div>

                    <button
                      type="button"
                      onClick={resetSmartControls}
                      style={{
                        border: "none",
                        background: "none",
                        color: "rgba(168,85,247,.88)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 800,
                        fontFamily: "inherit",
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              <div
                style={{
                  borderRadius: 18,
                  padding: 14,
                  background: "rgba(0,0,0,.22)",
                  border: "1px solid rgba(255,255,255,.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 1.8,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.55)",
                      textTransform: "uppercase",
                    }}
                  >
                    Upcoming content
                  </div>

                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "none",
                      color: "rgba(168,85,247,.85)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontFamily: "inherit",
                    }}
                  >
                    Preview
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.map((p, i) => (
                    <PlanRow key={`${p.day}-${i}`} item={p} />
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                  overflowX: "auto",
                  paddingBottom: 2,
                }}
              >
                {CONTENT_TYPE_OPTIONS.map((option) => {
                  const active = contentType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setContentType(option.value)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 14px",
                        borderRadius: 999,
                        border: active
                          ? "1px solid rgba(168,85,247,.45)"
                          : "1px solid rgba(255,255,255,.10)",
                        background: active
                          ? "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.12))"
                          : "rgba(255,255,255,.04)",
                        color: active ? "rgba(255,255,255,.94)" : "rgba(255,255,255,.55)",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        fontFamily: "inherit",
                      }}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {contentUsage && <UsageLimitCard usage={contentUsage} />}

              {canBuyOnDemand && userPlan && (
                <OnDemandPanel
                  singlePrice={userPlan.onDemand.extraVideoPriceUsd}
                  packPrice={userPlan.onDemand.extraVideoPack5PriceUsd}
                />
              )}

              
              {contentType === "reel" && (
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 16,
                    padding: "12px 12px 11px",
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "rgba(255,255,255,.82)",
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: 0.2,
                        }}
                      >
                        Reel Duration
                      </div>
                      <div
                        style={{
                          color: "rgba(255,255,255,.34)",
                          fontSize: 10,
                          marginTop: 3,
                        }}
                      >
                        Choose clip length for this generation.
                      </div>
                    </div>

                    {selectedBoost === "consistency" && (
                      <div
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "rgba(139,92,246,.12)",
                          border: "1px solid rgba(139,92,246,.22)",
                          color: "rgba(196,181,253,.86)",
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".08em",
                          flexShrink: 0,
                        }}
                      >
                        Extra Consistency
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {([5, 10, 15] as const).map((sec) => {
                      const disabled = !isReelDurationAllowed(selectedBoost, sec);
                      const active = reelDuration === sec;

                      return (
                        <button
                          key={sec}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            if (!disabled) setReelDuration(sec);
                          }}
                          style={{
                            flex: 1,
                            height: 38,
                            borderRadius: 11,
                            border: active
                              ? "1px solid rgba(168,85,247,.48)"
                              : "1px solid rgba(255,255,255,.09)",
                            background: active
                              ? "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.12))"
                              : "rgba(255,255,255,.04)",
                            color: disabled
                              ? "rgba(255,255,255,.22)"
                              : active
                              ? "rgba(255,255,255,.96)"
                              : "rgba(255,255,255,.62)",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.5 : 1,
                            transition: "all .18s ease",
                          }}
                        >
                          {sec}s
                        </button>
                      );
                    })}
                  </div>

                  {selectedBoost === "consistency" && (
                    <div
                      style={{
                        marginTop: 9,
                        color: "rgba(255,255,255,.28)",
                        fontSize: 10.5,
                        lineHeight: 1.5,
                      }}
                    >
                      15s is unavailable in Extra Consistency mode to preserve stronger identity stability.
                    </div>
                  )}

                  {contentType === "reel" && shouldShow15SecWarning(selectedBoost, reelDuration) && (
                    <div
                      style={{
                        marginTop: 9,
                        borderRadius: 10,
                        padding: "9px 10px",
                        background: "rgba(245,158,11,.08)",
                        border: "1px solid rgba(245,158,11,.18)",
                        color: "rgba(253,224,71,.88)",
                        fontSize: 10.5,
                        lineHeight: 1.5,
                      }}
                    >
                      Face consistency may be slightly lower on 15-second reels.
                    </div>
                  )}
                </div>
              )}

{matchedPlanItem && (
                <div
                  style={{
                    marginBottom: 10,
                    fontSize: 11,
                    color: "rgba(255,255,255,.42)",
                    lineHeight: 1.5,
                  }}
                >
                  Using concept: {matchedPlanItem.day} · {matchedPlanItem.title}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (contentType === "reel" && isCurrentLimitReached && canBuyOnDemand) {
                    handleBuyOnDemand();
                    return;
                  }

                  if (isCurrentLimitReached && !canBuyOnDemand) {
                    return;
                  }

                  void generatePlan();
                }}
disabled={
  loading ||
  activeJobId !== null ||
  (isCurrentLimitReached && !canBuyOnDemand)
}
                style={{
                  width: "100%",
                  padding: "15px 14px",
                  borderRadius: 18,
                  border:
                    contentType === "reel" && isCurrentLimitReached && canBuyOnDemand
                      ? "1px solid rgba(168,85,247,.40)"
                      : "1px solid rgba(168,85,247,.25)",
                  background:
                    contentType === "reel" && isCurrentLimitReached && canBuyOnDemand
                      ? "linear-gradient(135deg,rgba(168,85,247,.35),rgba(236,72,153,.28),rgba(99,102,241,.25))"
                      : GRAD,
                  color: "rgba(255,255,255,.96)",
                  fontWeight: 900,
                  fontSize: 14,
                  letterSpacing: 0.3,
                  cursor:
                    loading || (isCurrentLimitReached && !canBuyOnDemand)
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    loading || (isCurrentLimitReached && !canBuyOnDemand)
                      ? "none"
                      : "0 18px 50px rgba(168,85,247,.30),0 0 40px rgba(168,85,247,.15)",
                  opacity: loading || (isCurrentLimitReached && !canBuyOnDemand) ? 0.65 : 1,
                  fontFamily: "inherit",
                  transition: "opacity 200ms ease, box-shadow 200ms ease",
                }}
              >
                {getButtonLabel()}
              </button>

{activeJobId && jobStatus && !generated && (
  <div style={{ marginTop: 14 }}>
<ReelGenerationLoader
  jobStatus={jobStatus}
  jobId={activeJobId}
  onDismissError={() => {
        setGenerateError(null);
        setActiveJobId(null);
        setJobStatus(null);
      }}
    />
  </div>
)}

              {generateError && (
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(239,68,68,.10)",
                    border: "1px solid rgba(239,68,68,.22)",
                    color: "rgba(255,255,255,.88)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <span style={{ flexShrink: 0 }}>⚠️</span>
                  <span>{generateError}</span>
                </div>
              )}

              {generated && (
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 18,
                    padding: 14,
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,.05),0 16px 40px rgba(0,0,0,.28)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 1.3,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.52)",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    {getGeneratedLabel(generated.format)}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <div
                      style={{
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.08)",
                        width: "100%",
                        maxWidth: getPreviewMaxWidth(generated.format),
                        aspectRatio: getPreviewAspectRatio(generated.format),
                      }}
                    >
                      <img
                        src={generated.thumbnail_url}
                        alt={generated.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                          background: "rgba(255,255,255,.05)",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.95)",
                      marginBottom: 6,
                    }}
                  >
                    {generated.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,.60)",
                      marginBottom: 12,
                    }}
                  >
                    {generated.caption}
                  </div>

                  <a
                    href={generated.video_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 16px",
                      borderRadius: 999,
                      background:
                        "linear-gradient(135deg,rgba(168,85,247,.28),rgba(236,72,153,.20))",
                      border: "1px solid rgba(168,85,247,.30)",
                      color: "rgba(255,255,255,.92)",
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 0.2,
                    }}
                  >
                    {getGeneratedCtaLabel(generated.format)}
                  </a>

                  {usageInfo && (
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 11,
                        color: "rgba(255,255,255,.45)",
                        lineHeight: 1.6,
                      }}
                    >
                      Used: {usageInfo.used} / {usageInfo.limit} · Remaining:{" "}
                      {usageInfo.remaining}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {tab === "notes" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(0,0,0,.22)",
                  border: "1px solid rgba(255,255,255,.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    fontWeight: 800,
                    color: "rgba(255,255,255,.34)",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Persona-level control
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,.50)",
                    lineHeight: 1.6,
                    marginBottom: 14,
                  }}
                >
                  Add advanced instructions for this persona. These notes shape future
                  outputs like pose preference, environment style, camera feel, lighting,
                  face consistency priorities and what to avoid.
                </div>

                {!canUseAdvancedControls && (
                  <div
                    style={{
                      marginBottom: 12,
                      borderRadius: 14,
                      padding: 12,
                      background: "rgba(168,85,247,.08)",
                      border: "1px solid rgba(168,85,247,.18)",
                      color: "rgba(255,255,255,.72)",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    Creator or Agency plan required for Advanced Notes.
                  </div>
                )}

                <textarea
                  value={advancedNotes}
                  onChange={(e) => setAdvancedNotes(e.target.value)}
                  disabled={!canUseAdvancedControls}
                  placeholder="Example: Keep face identity extremely consistent. Prefer candid iPhone-style gym mirror shots, luxury cafe work moments, warm ambient flash, slightly imperfect framing. Avoid over-edited beauty shots and doll-like skin."
                  style={{
                    width: "100%",
                    minHeight: 180,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,.08)",
                    background: "rgba(255,255,255,.03)",
                    color: "rgba(255,255,255,.92)",
                    padding: "14px 14px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    opacity: canUseAdvancedControls ? 1 : 0.6,
                  }}
                />

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    {!canUseAdvancedControls
                      ? "Upgrade to Creator or Agency to save notes"
                      : activePersona.type === "custom"
                      ? `Saving notes for ${activePersona.name}`
                      : "Preset personas are view-only for now"}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSavePersonaMeta()}
                    disabled={
                      savingPersonaMeta ||
                      activePersona.type !== "custom" ||
                      !canUseAdvancedControls
                    }
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: "1px solid rgba(168,85,247,.24)",
                      background:
                        "linear-gradient(135deg,rgba(168,85,247,.22),rgba(236,72,153,.14))",
                      color: "rgba(255,255,255,.92)",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor:
                        savingPersonaMeta ||
                        activePersona.type !== "custom" ||
                        !canUseAdvancedControls
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        savingPersonaMeta ||
                        activePersona.type !== "custom" ||
                        !canUseAdvancedControls
                          ? 0.6
                          : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {savingPersonaMeta ? "Saving..." : "Save Notes"}
                  </button>
                </div>

                {personaMetaMessage && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "rgba(255,255,255,.66)",
                    }}
                  >
                    {personaMetaMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "brand" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(0,0,0,.22)",
                  border: "1px solid rgba(255,255,255,.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    fontWeight: 800,
                    color: "rgba(255,255,255,.34)",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Brand direction
                </div>

                {!canUseAdvancedControls && (
                  <div
                    style={{
                      marginBottom: 12,
                      borderRadius: 14,
                      padding: 12,
                      background: "rgba(168,85,247,.08)",
                      border: "1px solid rgba(168,85,247,.18)",
                      color: "rgba(255,255,255,.72)",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    Creator or Agency plan required for Brand Direction controls.
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <textarea
                    value={brandDirection}
                    onChange={(e) => setBrandDirection(e.target.value)}
                    disabled={!canUseAdvancedControls}
                    placeholder="Describe the overall brand direction. Example: Premium feminine fitness creator with clean luxury energy, natural realism, candid iPhone look, soft flash nightlife moments and polished wellness lifestyle."
                    style={{
                      width: "100%",
                      minHeight: 120,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,.08)",
                      background: "rgba(255,255,255,.03)",
                      color: "rgba(255,255,255,.92)",
                      padding: "14px",
                      fontSize: 13,
                      lineHeight: 1.6,
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      opacity: canUseAdvancedControls ? 1 : 0.6,
                    }}
                  />

                  <input
                    value={brandKeywords}
                    onChange={(e) => setBrandKeywords(e.target.value)}
                    disabled={!canUseAdvancedControls}
                    placeholder="Keywords: soft flash, iPhone candid, luxury gym, neutral tones, editorial but natural"
                    style={{
                      width: "100%",
                      height: 46,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,.08)",
                      background: "rgba(255,255,255,.03)",
                      color: "rgba(255,255,255,.92)",
                      padding: "0 14px",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      opacity: canUseAdvancedControls ? 1 : 0.6,
                    }}
                  />

                  <textarea
                    value={visualDoNotUse}
                    onChange={(e) => setVisualDoNotUse(e.target.value)}
                    disabled={!canUseAdvancedControls}
                    placeholder="Do not use: doll-like skin, over-airbrushed face, extreme close-up portraits only, stiff poses, cartoon lighting, unrealistic background blur"
                    style={{
                      width: "100%",
                      minHeight: 110,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,.08)",
                      background: "rgba(255,255,255,.03)",
                      color: "rgba(255,255,255,.92)",
                      padding: "14px",
                      fontSize: 13,
                      lineHeight: 1.6,
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      opacity: canUseAdvancedControls ? 1 : 0.6,
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    {!canUseAdvancedControls
                      ? "Upgrade to Creator or Agency to save brand rules"
                      : activePersona.type === "custom"
                      ? `Brand rules for ${activePersona.name}`
                      : "Preset personas are view-only for now"}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSavePersonaMeta()}
                    disabled={
                      savingPersonaMeta ||
                      activePersona.type !== "custom" ||
                      !canUseAdvancedControls
                    }
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: "1px solid rgba(168,85,247,.24)",
                      background:
                        "linear-gradient(135deg,rgba(168,85,247,.22),rgba(236,72,153,.14))",
                      color: "rgba(255,255,255,.92)",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor:
                        savingPersonaMeta ||
                        activePersona.type !== "custom" ||
                        !canUseAdvancedControls
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        savingPersonaMeta ||
                        activePersona.type !== "custom" ||
                        !canUseAdvancedControls
                          ? 0.6
                          : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {savingPersonaMeta ? "Saving..." : "Save Brand"}
                  </button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <PremiumBoostPanel
                    currentPlan={
                      userPlan?.id?.toLowerCase().includes("agency")
                        ? "agency"
                        : userPlan?.id?.toLowerCase().includes("creator")
                        ? "creator"
                        : "pro"
                    }
                    freeAllureRemaining={freeAllureRemaining}
                    freeConsistencyRemaining={freeConsistencyRemaining}
                    selectedBoost={selectedBoost}
                    onSelectBoost={(mode) => {
                      setSelectedBoost(mode);
                    }}
                  />
                </div>

                {personaMetaMessage && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "rgba(255,255,255,.66)",
                    }}
                  >
                    {personaMetaMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
