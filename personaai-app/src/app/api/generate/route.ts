import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";
import { resolveBoostMode, getBoostPriceUsd } from "@/lib/generation/boost-routing";
import { getOrCreateBoostEntitlement, hasFreeBoostAvailable, consumeFreeBoost } from "@/lib/generation/boost-entitlements";
import { resolvePlan } from "@/config/plans";
import { generateImageContent } from "@/lib/generation/image";
import { resolveGenerationConfig, selectBestCandidate } from "@/lib/generation/pipeline";
import type { GenerationRequestInput, GeneratedCandidate } from "@/lib/generation/types";
import type { AppPlan, AllureProfile } from "@/lib/plans/capabilities";
import { generateVideoContent } from "@/lib/generation/video";
import { createClient } from "@/lib/supabase/server";

type GenerateFormat = "reel" | "story" | "post";
type ContentType = "reel" | "story" | "post";
type UsageType = "video" | "story" | "post";

type TrendType =
  | "hook"
  | "audio"
  | "format"
  | "shot_pattern"
  | "cta"
  | "hashtag";

type TrendSnapshotRow = {
  id?: string;
  platform?: string | null;
  region?: string | null;
  niche?: string | null;
  trend_type?: TrendType | string | null;
  title?: string | null;
  signal_strength?: number | null;
  summary?: string | null;
  raw_data?: Record<string, unknown> | null;
  captured_at?: string | null;
  created_at?: string | null;
};

type TrendSignals = {
  hooks: string[];
  audioMoods: string[];
  formats: string[];
  shotPatterns: string[];
  ctas: string[];
  hashtags: string[];
  summary: string[];
};

type ReelPlanningContext = {
  viralAngle: string | null;
  hookOptions: string[];
  shotDirection: string[];
  pacingNotes: string[];
  coverTextIdeas: string[];
  audioDirection: string | null;
  ctaIdeas: string[];
};

type SmartControlsPayload = {
  strategy?: string | null;
  look?: string | null;
  motion?: string | null;
  priorities?: string[] | null;
  customNote?: string | null;
};

function getAssetKind(contentType: ContentType): "video" | "image" {
  return contentType === "reel" ? "video" : "image";
}

function getAspectRatio(contentType: ContentType): "9:16" | "1:1" {
  return contentType === "post" ? "1:1" : "9:16";
}

function canUseAdvancedPromptControls(planId?: string | null): boolean {
  const normalized = (planId ?? "").toLowerCase();
  return normalized.includes("creator") || normalized.includes("agency");
}

function emptyTrendSignals(): TrendSignals {
  return {
    hooks: [],
    audioMoods: [],
    formats: [],
    shotPatterns: [],
    ctas: [],
    hashtags: [],
    summary: [],
  };
}

function uniqueTop(
  items: Array<string | null | undefined>,
  limit = 6
): string[] {
  return [...new Set(items.map((x) => (x ?? "").trim()).filter(Boolean))].slice(
    0,
    limit
  );
}

function hasAnyTrendSignals(signals: TrendSignals): boolean {
  return (
    signals.hooks.length > 0 ||
    signals.audioMoods.length > 0 ||
    signals.formats.length > 0 ||
    signals.shotPatterns.length > 0 ||
    signals.ctas.length > 0 ||
    signals.hashtags.length > 0 ||
    signals.summary.length > 0
  );
}

function normalizeTrendRows(rows: TrendSnapshotRow[]): TrendSignals {
  return {
    hooks: uniqueTop(
      rows.filter((x) => x.trend_type === "hook").map((x) => x.title),
      6
    ),
    audioMoods: uniqueTop(
      rows.filter((x) => x.trend_type === "audio").map((x) => x.title),
      6
    ),
    formats: uniqueTop(
      rows.filter((x) => x.trend_type === "format").map((x) => x.title),
      6
    ),
    shotPatterns: uniqueTop(
      rows.filter((x) => x.trend_type === "shot_pattern").map((x) => x.title),
      6
    ),
    ctas: uniqueTop(
      rows.filter((x) => x.trend_type === "cta").map((x) => x.title),
      6
    ),
    hashtags: uniqueTop(
      rows.filter((x) => x.trend_type === "hashtag").map((x) => x.title),
      8
    ),
    summary: uniqueTop(rows.map((x) => x.summary), 8),
  };
}

async function getTrendSignals(params: {
  niche?: string | null;
  region?: string | null;
  contentType: ContentType;
  premiumEnabled: boolean;
}): Promise<TrendSignals> {
  const { niche, region, contentType, premiumEnabled } = params;

  if (!premiumEnabled) {
    return emptyTrendSignals();
  }

  const effectiveNiche = (niche ?? "general").trim() || "general";
  const effectiveRegion = (region ?? "global").trim() || "global";

  const hoursBack = contentType === "reel" ? 96 : 120;
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  const preferredPlatforms =
    contentType === "reel"
      ? ["tiktok", "instagram"]
      : ["instagram", "tiktok"];

  try {
    const { data, error } = await supabaseAdmin
      .from("trend_snapshots")
      .select(
        "id, platform, region, niche, trend_type, title, signal_strength, summary, raw_data, captured_at, created_at"
      )
      .eq("niche", effectiveNiche)
      .eq("region", effectiveRegion)
      .gte("captured_at", since)
      .order("signal_strength", { ascending: false })
      .order("captured_at", { ascending: false })
      .limit(120);

    if (error) {
      console.error("trend_snapshots read error:", error.message);
      return emptyTrendSignals();
    }

    const rows = (data ?? []) as TrendSnapshotRow[];

    const sortedRows = [...rows].sort((a, b) => {
      const platformA = preferredPlatforms.indexOf(
        (a.platform ?? "").toLowerCase()
      );
      const platformB = preferredPlatforms.indexOf(
        (b.platform ?? "").toLowerCase()
      );

      const pa = platformA === -1 ? 999 : platformA;
      const pb = platformB === -1 ? 999 : platformB;

      if (pa !== pb) return pa - pb;

      const sa =
        Number(b.signal_strength ?? 0) - Number(a.signal_strength ?? 0);
      if (sa !== 0) return sa;

      return String(b.captured_at ?? "").localeCompare(
        String(a.captured_at ?? "")
      );
    });

    return normalizeTrendRows(sortedRows);
  } catch (error) {
    console.error("getTrendSignals unexpected error:", error);
    return emptyTrendSignals();
  }
}

function buildReelPlanningContext(input: {
  planTitle?: string | null;
  planDay?: string | null;
  planType?: string | null;
  personaName?: string | null;
  niche?: string | null;
  style?: string | null;
  personality?: string | null;
  brandDirection?: string | null;
  advancedNotes?: string | null;
  trendSignals: TrendSignals;
  smartControls?: SmartControlsPayload | null;
}): ReelPlanningContext {
  const {
    planTitle,
    planDay,
    planType,
    niche,
    style,
    personality,
    trendSignals,
    smartControls,
  } = input;

  const strategy = smartControls?.strategy?.trim() || null;
  const motion = smartControls?.motion?.trim() || null;

  const viralAngle =
    planTitle && trendSignals.formats.length > 0
      ? `${planTitle} concept presented through ${trendSignals.formats[0]}`
      : planTitle
      ? `${planTitle} concept with creator-native short-form framing`
      : trendSignals.formats[0] ?? strategy ?? null;

  const hookOptions = uniqueTop(
    [
      ...trendSignals.hooks,
      planTitle ? `POV: ${planTitle}` : null,
      planTitle ? `My current ${planTitle.toLowerCase()}` : null,
      planType ? `A ${planType.toLowerCase()} that actually feels real` : null,
      niche ? `Come with me for a ${niche.toLowerCase()} moment` : null,
      strategy,
    ],
    5
  );

  const shotDirection = uniqueTop(
    [
      ...trendSignals.shotPatterns,
      motion,
      "fast intro frame",
      "environment establishing shot",
      "action-focused middle shot",
      "close detail payoff shot",
      "caption-overlay friendly frame",
    ],
    6
  );

  const pacingNotes = uniqueTop(
    [
      "First 3 seconds must hook immediately",
      "Keep framing phone-native and social-first",
      trendSignals.audioMoods[0]
        ? `Edit rhythm should match ${trendSignals.audioMoods[0]}`
        : "Use quick-cut but natural pacing",
      style ? `Keep visual tone aligned with ${style}` : null,
      personality ? `Preserve persona personality: ${personality}` : null,
      strategy ? `Strategy mode: ${strategy}` : null,
    ],
    5
  );

  const coverTextIdeas = uniqueTop(
    [
      planTitle,
      hookOptions[0],
      hookOptions[1],
      niche ? `${niche} routine` : null,
      planDay ? `${planDay} content` : null,
    ],
    4
  );

  return {
    viralAngle,
    hookOptions,
    shotDirection,
    pacingNotes,
    coverTextIdeas,
    audioDirection: trendSignals.audioMoods[0] ?? null,
    ctaIdeas: uniqueTop(
      [
        ...trendSignals.ctas,
        "Follow for more",
        "Save this for later",
        "Comment if you want part 2",
      ],
      4
    ),
  };
}

function buildGenerationPromptSummary(input: {
  contentType: ContentType;
  personaName?: string;
  planTitle?: string | null;
  planDay?: string | null;
  planType?: string | null;
  niche?: string | null;
  region?: string | null;
  hasAdvancedControls: boolean;
  trendSignals: TrendSignals;
  reelPlanningContext?: ReelPlanningContext | null;
  smartControls?: SmartControlsPayload | null;
}) {
  const { trendSignals, reelPlanningContext, smartControls } = input;

  const parts = [
    `${input.contentType} generation for ${input.personaName || "Persona"}`,
    input.planTitle ? `planTitle=${input.planTitle}` : null,
    input.planDay ? `planDay=${input.planDay}` : null,
    input.planType ? `planType=${input.planType}` : null,
    input.niche ? `niche=${input.niche}` : null,
    input.region ? `region=${input.region}` : null,
    `advancedControls=${input.hasAdvancedControls ? "yes" : "no"}`,
    `trendSignals=${hasAnyTrendSignals(trendSignals) ? "yes" : "no"}`,
    trendSignals.formats[0] ? `trendFormat=${trendSignals.formats[0]}` : null,
    trendSignals.hooks[0] ? `trendHook=${trendSignals.hooks[0]}` : null,
    trendSignals.audioMoods[0]
      ? `trendAudio=${trendSignals.audioMoods[0]}`
      : null,
    reelPlanningContext?.viralAngle
      ? `reelViralAngle=${reelPlanningContext.viralAngle}`
      : null,
    smartControls?.strategy ? `smartStrategy=${smartControls.strategy}` : null,
    smartControls?.look ? `smartLook=${smartControls.look}` : null,
    smartControls?.motion ? `smartMotion=${smartControls.motion}` : null,
    smartControls?.priorities?.length
      ? `smartPriorities=${smartControls.priorities.join(", ")}`
      : null,
    smartControls?.customNote ? `smartNote=${smartControls.customNote}` : null,
  ];

  return parts.filter(Boolean).join(" | ");
}

type SmartControlsInput = {
  strategy?: string | null;
  look?: string | null;
  motion?: string | null;
  priorities?: string[] | null;
  customNote?: string | null;
};

type GenerateRequestBody = {
  personaId?: string;
  personaName?: string;
  personaType?: "preset" | "custom";
  contentType?: ContentType;
  shotPresetId?: string;
  prompt?: string;
  allureProfile?: AllureProfile;
  onDemand?: boolean;
  planTitle?: string | null;
  planDay?: string | null;
  planType?: string | null;
  niche?: string | null;
  region?: string | null;
  smartControls?: SmartControlsInput;
  faceImageUrl?: string | null;
  coverImageUrl?: string | null;
  references?: Array<{
    image_url?: string | null;
    [key: string]: unknown;
  }> | null;
  identityLock?: boolean;
  allureMode?: boolean;
  allureBoost?: boolean;
  extraConsistency?: boolean;
  durationSeconds?: 5 | 10 | 15 | null;
};

type GenerateResponse =
  | {
      success: true;
      mode?: "direct" | "async_reel";
      jobId?: string;
      status?: "queued" | "processing" | "completed" | "failed";
      content?: {
        title: string;
        caption: string;
        video_url: string;
        thumbnail_url: string;
        format: GenerateFormat;
        face_image_url?: string | null;
      };
      usageType: UsageType;
      usage: {
        used: number;
        limit: number;
        remaining: number;
      };
    }
  | {
      success: false;
      error: string;
      message?: string;
      onDemand?: {
        enabled: boolean;
        extraVideoPriceUsd: number;
        extraVideoPack5PriceUsd: number;
      };
    };

function buildSmartControlsPromptBlock(
  smartControls?: SmartControlsInput | null
): string | null {
  if (!smartControls) return null;

  const lines: string[] = [];

  if (smartControls.strategy) {
    const strategyMap: Record<string, string> = {
      viral_reach:
        "Prioritize stronger hooks, thumb-stopping first impressions, faster social-native energy, more immediate visual payoff, and content patterns that feel highly shareable and save-worthy. Favor bolder framing, stronger opening moments, and more platform-native attention capture.",
      brand_safe:
        "Keep the output polished, clean, tasteful, premium, and broadly advertiser-safe. Avoid risky styling, excessive sensuality, chaotic framing, messy environments, controversial cues, or anything that feels too provocative, low-trust, or off-brand.",
      conversion:
        "Bias the content toward conversion-oriented framing. The image should feel persuasive, value-forward, clear, and commercially useful, with stronger product relevance, stronger action intent, more deliberate composition, and a subtle performance-marketing mindset.",
      community:
        "Encourage relatability, warmth, comments, saves, repeat engagement, and audience connection. Favor human moments, approachable realism, emotionally accessible framing, and content that feels interactive, personal, and easy to respond to.",
    };

    lines.push(
      `Strategy Priority: ${
        strategyMap[smartControls.strategy] ?? smartControls.strategy
      }`
    );
  }

  if (smartControls.look) {
    const lookMap: Record<string, string> = {
      luxury_realism:
        "Use an elevated premium-but-believable visual style. The environment should feel upscale, refined, clean, curated, and aspirational while still realistic. Favor cleaner composition, tidier surfaces, better materials, tasteful wardrobe styling, soft controlled natural light, and polished lifestyle cues. Avoid messy clutter, cheap-looking domestic randomness, harsh casual chaos, and low-effort everyday staging.",
      phone_native:
        "Keep visuals raw, natural, phone-camera-native, candid, spontaneous, and socially believable. Favor slightly imperfect framing, lived-in environments, casual everyday realism, natural clutter, unpolished composition, and authentic creator energy. Avoid premium editorial polish, luxury staging, over-clean composition, excessively curated styling, and ad-like perfection.",
      clean_editorial:
        "Use polished composition and clean styling while still avoiding fake AI beauty or overprocessed skin.",
      warm_lifestyle:
        "Use warm, natural, human lifestyle energy with approachable, soft, realistic atmosphere.",
    };

    lines.push(
      `Visual Look: ${lookMap[smartControls.look] ?? smartControls.look}`
    );
  }

  if (smartControls.motion) {
    const motionMap: Record<string, string> = {
      calm:
        "Keep motion softer, smoother, slower, more controlled, and less attention-seeking. Favor relaxed body language, understated movement, quieter visual rhythm, and a composed, effortless feel rather than high stimulation or aggressive social pacing.",
      balanced:
        "Keep motion natural, creator-native, believable, and socially fluent. Favor moderate pacing, realistic movement, everyday human energy, and content that feels platform-ready without becoming too slow, too polished, or too hyperactive.",
      fast_hooky:
        "Use faster social-native rhythm, stronger opening motion cues, more immediate attention capture, and more dynamic creator energy. Favor bolder body language, stronger first-frame visual pull, and a more instantly engaging short-form feel.",
      cinematic_social:
        "Keep motion elevated, stylish, and visually refined, but still compatible with social platforms. Favor graceful movement, polished pacing, premium visual rhythm, and a more aspirational feel without drifting into artificial film-scene aesthetics.",
    };

    lines.push(
      `Motion Direction: ${
        motionMap[smartControls.motion] ?? smartControls.motion
      }`
    );
  }

  if (smartControls.priorities && smartControls.priorities.length > 0) {
    const priorityMap: Record<string, string> = {
      face_consistency:
        "Protect face identity consistency as a top priority across the final output.",
      realism: "Prioritize realism and avoid artificial AI-looking results.",
      hook_strength:
        "Improve the first impression and opening-frame attention strength.",
      brand_match:
        "Keep the result closely aligned with brand direction and persona identity.",
      conversion: "Bias toward performance and action-taking behavior.",
      trend_fit:
        "Keep output aligned with current short-form social content patterns.",
    };

    const mapped = smartControls.priorities.map(
      (item) => priorityMap[item] ?? item
    );

    lines.push(`Priority Stack: ${mapped.join(" ")}`);
  }

  if (smartControls.customNote?.trim()) {
    lines.push(`Custom Output Note: ${smartControls.customNote.trim()}`);
  }

  if (lines.length === 0) return null;

  return lines.join("\n");
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<GenerateResponse>> {
  try {
const supabase = await createClient();

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  return NextResponse.json(
    {
      success: false,
      error: "UNAUTHORIZED",
      message: "User not authenticated.",
    },
    { status: 401 }
  );
}

    const body: GenerateRequestBody = await req.json().catch(() => ({}));

    const allureBoost = body.allureBoost === true;
    const extraConsistency = body.extraConsistency === true;
    const requestedDuration =
      body.durationSeconds === 5 || body.durationSeconds === 10 || body.durationSeconds === 15
        ? body.durationSeconds
        : null;

    const providerRoute = resolveBoostMode({
      allureBoost,
      extraConsistency,
    });

    const safeDurationSeconds =
      providerRoute === "extra_consistency" && requestedDuration === 15
        ? 10
        : requestedDuration;

    let boostPurchaseRequired = false;
    let boostChargeUsd: number | null = null;

    if (!body.personaId || !body.contentType || !body.shotPresetId) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "personaId, contentType ve shotPresetId zorunlu.",
        },
        { status: 400 }
      );
    }

    const faceImageUrl = body.faceImageUrl ?? body.coverImageUrl ?? null;
    const coverImageUrl = body.coverImageUrl ?? null;

    const referenceImages = Array.isArray(body.references)
      ? body.references
          .map(
            (ref: { image_url?: string | null; [key: string]: unknown }) =>
              ref?.image_url
          )
          .filter(Boolean)
      : [];

    const smartControls: SmartControlsInput = {
      strategy: body.smartControls?.strategy ?? null,
      look: body.smartControls?.look ?? null,
      motion: body.smartControls?.motion ?? null,
      priorities: body.smartControls?.priorities ?? [],
      customNote: body.smartControls?.customNote ?? null,
    };

    const smartControlsPromptBlock =
      buildSmartControlsPromptBlock(smartControls);

    let personaFaceImageUrl: string | null = null;
    let personaNiche: string | null = null;
    let personaStyle: string | null = null;
    let personaPersonality: string | null = null;
    let personaAdvancedNotes: string | null = null;
    let personaBrandDirection: string | null = null;
    let personaBrandKeywords: string | null = null;
    let personaVisualDoNotUse: string | null = null;
    let personaReferenceImages: string[] = [];

    if (body.personaType === "custom" && body.personaId) {
      const { data: personaRow } = await supabaseAdmin
        .from("personas")
        .select(
          "face_image_url, niche, style, personality, advanced_prompt_notes, brand_direction, brand_keywords, visual_do_not_use"
        )
        .eq("id", body.personaId)
        .eq("user_id", user.id)
        .maybeSingle();

      personaFaceImageUrl = personaRow?.face_image_url ?? null;
      personaNiche = personaRow?.niche ?? null;
      personaStyle = personaRow?.style ?? null;
      personaPersonality = personaRow?.personality ?? null;
      personaAdvancedNotes = personaRow?.advanced_prompt_notes ?? null;
      personaBrandDirection = personaRow?.brand_direction ?? null;
      personaBrandKeywords = personaRow?.brand_keywords ?? null;
      personaVisualDoNotUse = personaRow?.visual_do_not_use ?? null;

      const { data: referenceRows } = await supabaseAdmin
        .from("persona_reference_images")
        .select("image_url, sort_order, is_primary")
        .eq("persona_id", body.personaId)
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true });

      personaReferenceImages =
        referenceRows
          ?.map((row: { image_url: string }) => row.image_url)
          .filter((url: string) => Boolean(url)) ?? [];

      if (personaReferenceImages.length === 0 && personaFaceImageUrl) {
        personaReferenceImages = [personaFaceImageUrl];
      }
    }

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("current_plan_id")
      .eq("user_id", user.id)
      .single();

    const currentPlanId: string | null = profile?.current_plan_id ?? null;

    if (providerRoute !== "standard") {
      const entitlement = await getOrCreateBoostEntitlement({
        userId: user.id,
        planId: currentPlanId,
      });

      const hasFree = hasFreeBoostAvailable(providerRoute, entitlement);

      if (hasFree) {
        await consumeFreeBoost({
          entitlementId: entitlement.id,
          mode: providerRoute,
        });
      } else {
        boostPurchaseRequired = true;
        boostChargeUsd = getBoostPriceUsd(providerRoute);
      }
    }
    const canUseAdvancedControls = canUseAdvancedPromptControls(currentPlanId);

    // resolvedPlan is used exclusively for usage limits, pricing, and onDemand checks
    const resolvedPlan = resolvePlan(currentPlanId);

    // appPlan is used exclusively as the pipeline identity type
    const appPlan: AppPlan =
      currentPlanId === "agency"
        ? "agency"
        : currentPlanId === "creator"
        ? "creator"
        : "pro";

    const pipelineInput: GenerationRequestInput = {
      personaId: body.personaId,
      userId: user.id,
      plan: appPlan,
      contentType: body.contentType,
      shotPresetId: body.shotPresetId,
      prompt: body.prompt,
      allureMode: body.allureMode ?? true,
      identityLock: body.identityLock ?? false,
      allureProfile: body.allureProfile,
    };

    const generationConfig = resolveGenerationConfig(pipelineInput);
console.log("PIPELINE DEBUG", {
  appPlan,
  pipelineInput,
  generationConfig,
});
    const contentType: ContentType = generationConfig.contentType;
    const shotPresetId = generationConfig.shotPresetId;

    const usageMonth = new Date().toISOString().slice(0, 7);

    const { data: usageRow } = await supabaseAdmin
      .from("content_usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("usage_month", usageMonth)
      .maybeSingle();

    const usedVideo = usageRow?.videos_used ?? 0;
    const usedStory = usageRow?.stories_used ?? 0;
    const usedPost = usageRow?.posts_used ?? 0;

    const usageType: UsageType =
      contentType === "post"
        ? "post"
        : contentType === "story"
        ? "story"
        : "video";

    const used =
      usageType === "post"
        ? usedPost
        : usageType === "story"
        ? usedStory
        : usedVideo;

    const limit =
      usageType === "post"
        ? resolvedPlan.limits.post
        : usageType === "story"
        ? resolvedPlan.limits.story
        : resolvedPlan.limits.video;

    if (used >= limit) {
      if (usageType === "video" && resolvedPlan.onDemand.enabled) {
        return NextResponse.json(
          {
            success: false,
            error: "LIMIT_REACHED",
            message: `${usageType} limit reached`,
            onDemand: resolvedPlan.onDemand,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "LIMIT_REACHED",
          message: `${usageType} limit reached`,
        },
        { status: 403 }
      );
    }

    const effectiveNiche = body.niche ?? personaNiche ?? null;
    const effectiveRegion = body.region ?? "global";

    const advancedPromptPayload = {
      advancedNotes: canUseAdvancedControls ? personaAdvancedNotes : null,
      brandDirection: canUseAdvancedControls ? personaBrandDirection : null,
      brandKeywords: canUseAdvancedControls ? personaBrandKeywords : null,
      visualDoNotUse: canUseAdvancedControls ? personaVisualDoNotUse : null,
    };

    const trendSignals = await getTrendSignals({
      niche: effectiveNiche,
      region: effectiveRegion,
      contentType,
      premiumEnabled: canUseAdvancedControls,
    });

    const reelPlanningContext: ReelPlanningContext | null =
      contentType === "reel"
        ? buildReelPlanningContext({
            planTitle: body.planTitle ?? null,
            planDay: body.planDay ?? null,
            planType: body.planType ?? null,
            personaName: body.personaName ?? null,
            niche: effectiveNiche,
            style: personaStyle,
            personality: personaPersonality,
            brandDirection: advancedPromptPayload.brandDirection,
            advancedNotes: advancedPromptPayload.advancedNotes,
            trendSignals,
            smartControls,
          })
        : null;

    let content: {
      title: string;
      caption: string;
      video_url: string;
      thumbnail_url: string;
      format: GenerateFormat;
      face_image_url?: string | null;
    };

    if (contentType === "post" || contentType === "story") {
      const imageResult = await generateImageContent({
        personaName: body.personaName,
        contentType,
        referenceImageUrl: personaFaceImageUrl,
        referenceImageUrls: personaFaceImageUrl ? [personaFaceImageUrl] : [],
        identityLock: body.identityLock ?? true,
        allureMode: body.allureMode ?? false,
        niche: effectiveNiche,
        style: personaStyle,
        personality: personaPersonality,
        advancedNotes: advancedPromptPayload.advancedNotes,
        brandDirection: advancedPromptPayload.brandDirection,
        brandKeywords: advancedPromptPayload.brandKeywords,
        visualDoNotUse: advancedPromptPayload.visualDoNotUse,
        planTitle: body.planTitle ?? null,
        planDay: body.planDay ?? null,
        planType: body.planType ?? null,
        trendSignals: hasAnyTrendSignals(trendSignals)
          ? {
              hooks: trendSignals.hooks,
              audioMoods: trendSignals.audioMoods,
              formats: trendSignals.formats,
              shotPatterns: trendSignals.shotPatterns,
              ctas: trendSignals.ctas,
              hashtags: trendSignals.hashtags,
              summary: trendSignals.summary,
            }
          : null,
        smartControls,
        smartControlsPromptBlock,
      });

      const postStoryCaptionParts = [
        contentType === "post"
          ? "Generated post with AI"
          : "Generated story with AI",
        smartControls?.look ? `Look: ${smartControls.look}` : null,
        smartControls?.motion ? `Motion: ${smartControls.motion}` : null,
      ];

      content = {
        title:
          contentType === "post"
            ? `${body.personaName || "Persona"} Post`
            : `${body.personaName || "Persona"} Story`,
        caption: postStoryCaptionParts.filter(Boolean).join(" | "),
        video_url: imageResult.imageUrl,
        thumbnail_url: imageResult.thumbnailUrl,
        format: contentType,
        face_image_url: personaFaceImageUrl,
      };

} else {
  const reelCaptionParts = [
    "Reel job queued",
    reelPlanningContext?.hookOptions?.[0]
      ? `Hook: ${reelPlanningContext.hookOptions[0]}`
      : null,
    reelPlanningContext?.audioDirection
      ? `Audio mood: ${reelPlanningContext.audioDirection}`
      : null,
    smartControls?.look ? `Look: ${smartControls.look}` : null,
    smartControls?.motion ? `Motion: ${smartControls.motion}` : null,
  ];

  const queuedTitle = `${body.personaName || "Persona"} Reel`;
  const queuedCaption = reelCaptionParts.filter(Boolean).join(" | ");

  const { data: jobRow, error: jobInsertError } = await supabaseAdmin
    .from("generation_jobs")
    .insert({
      user_id: user.id,
      persona_id: body.personaId ?? null,
      content_type: contentType,
      status: "queued",
      prompt: buildGenerationPromptSummary({
        contentType,
        personaName: body.personaName,
        planTitle: body.planTitle ?? null,
        planDay: body.planDay ?? null,
        planType: body.planType ?? null,
        niche: effectiveNiche,
        region: effectiveRegion,
        hasAdvancedControls: canUseAdvancedControls,
        trendSignals,
        reelPlanningContext,
        smartControls,
      }),
      title: queuedTitle,
      caption: queuedCaption,
payload: {
  userId: user.id,
  personaId: body.personaId,
  personaName: body.personaName,
  personaType: body.personaType,
  contentType,
  planTitle: body.planTitle ?? null,
  planDay: body.planDay ?? null,
  planType: body.planType ?? null,
  niche: effectiveNiche,
  region: effectiveRegion,
  smartControls,
  faceImageUrl:
    body.faceImageUrl ??
    body.coverImageUrl ??
    personaFaceImageUrl ??
    null,
  coverImageUrl: body.coverImageUrl ?? null,
  references: Array.isArray(body.references) ? body.references : [],
  identityLock: body.identityLock ?? true,
  allureMode: body.allureMode ?? false,
  advancedPromptPayload,
  trendSignals,
  reelPlanningContext,
  personaStyle,
  personaPersonality,
  personaFaceImageUrl,
},
    })
.select("id, status, created_at")
    .single();

  if (jobInsertError || !jobRow?.id) {
    return NextResponse.json(
      {
        success: false,
        error: "JOB_CREATE_FAILED",
        message: jobInsertError?.message ?? "Failed to create reel generation job.",
      },
      { status: 500 }
    );
  }
  const newUsed = used + 1;

  if (usageRow?.id) {
    const updatePayload =
      usageType === "post"
        ? { posts_used: newUsed }
        : usageType === "story"
        ? { stories_used: newUsed }
        : { videos_used: newUsed };

    await supabaseAdmin
      .from("content_usage")
      .update(updatePayload)
      .eq("id", usageRow.id);
  } else {
    await supabaseAdmin.from("content_usage").insert({
      user_id: user.id,
      usage_month: usageMonth,
      videos_used: usageType === "video" ? 1 : 0,
      stories_used: usageType === "story" ? 1 : 0,
      posts_used: usageType === "post" ? 1 : 0,
    });
  }

  return NextResponse.json({
    success: true,
    mode: "async_reel",
    jobId: jobRow.id,
status: jobRow.status,
createdAt: jobRow.created_at,
    usageType,
    usage: {
      used: newUsed,
      limit,
      remaining: Math.max(limit - newUsed, 0),
    },
  });
}

    const assetKind = getAssetKind(contentType);
    const aspectRatio = getAspectRatio(contentType);

    const generationPromptSummary = buildGenerationPromptSummary({
      contentType,
      personaName: body.personaName,
      planTitle: body.planTitle ?? null,
      planDay: body.planDay ?? null,
      planType: body.planType ?? null,
      niche: effectiveNiche,
      region: effectiveRegion,
      hasAdvancedControls: canUseAdvancedControls,
      trendSignals,
      reelPlanningContext,
      smartControls,
    });

    const { error: generatedContentInsertError } = await supabaseAdmin
      .from("generated_content")
      .insert({
        user_id: user.id,
        persona_id:
          body.personaType === "custom" ? body.personaId ?? null : null,
        title: content.title,
        caption: content.caption,
        content_type: contentType,
        allure_boost: allureBoost,
        extra_consistency: extraConsistency,
        provider_route: providerRoute,
        duration_seconds: null,
        boost_charge_usd: boostChargeUsd,
        boost_purchase_required: boostPurchaseRequired,
        asset_kind: assetKind,
        aspect_ratio: aspectRatio,
        type: contentType,
        format: content.format,
        video_url: assetKind === "video" ? content.video_url : null,
        thumbnail_url: content.thumbnail_url,
        status: "ready",
        prompt: generationPromptSummary,
      });

    if (generatedContentInsertError) {
      return NextResponse.json(
        {
          success: false,
          error: "GENERATED_CONTENT_INSERT_FAILED",
          message: generatedContentInsertError.message,
        },
        { status: 500 }
      );
    }

    const newUsed = used + 1;

    if (usageRow?.id) {
      const updatePayload =
        usageType === "post"
          ? { posts_used: newUsed }
          : usageType === "story"
          ? { stories_used: newUsed }
          : { videos_used: newUsed };

      await supabaseAdmin
        .from("content_usage")
        .update(updatePayload)
        .eq("id", usageRow.id);
    } else {
      await supabaseAdmin.from("content_usage").insert({
        user_id: user.id,
        usage_month: usageMonth,
        videos_used: usageType === "video" ? 1 : 0,
        stories_used: usageType === "story" ? 1 : 0,
        posts_used: usageType === "post" ? 1 : 0,
      });
    }

    void faceImageUrl;
    void coverImageUrl;
    void referenceImages;
    void shotPresetId;
    void personaReferenceImages;
    void selectBestCandidate;
    void ({} as GeneratedCandidate);

    return NextResponse.json({
      success: true,
      content,
      usageType,
      usage: {
        used: newUsed,
        limit,
        remaining: Math.max(limit - newUsed, 0),
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
