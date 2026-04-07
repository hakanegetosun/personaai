import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";
import { generateImageContent } from "@/lib/generation/image";
import { generateVideoContent } from "@/lib/generation/video";

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

type SmartControlsInput = {
  strategy?: string | null;
  look?: string | null;
  motion?: string | null;
  priorities?: string[] | null;
  customNote?: string | null;
};

type ProcessReelBody = {
  jobId: string;
  userId: string;
  personaId?: string;
  personaName?: string;
  personaType?: "preset" | "custom";
  contentType: "reel";
  planTitle?: string | null;
  planDay?: string | null;
  planType?: string | null;
  niche?: string | null;
  region?: string | null;
  smartControls?: SmartControlsInput;
  faceImageUrl?: string | null;
  coverImageUrl?: string | null;
  references?: Array<{ image_url?: string | null; [key: string]: unknown }>;
  identityLock?: boolean;
  allureMode?: boolean;
  advancedPromptPayload?: {
    advancedNotes?: string | null;
    brandDirection?: string | null;
    brandKeywords?: string | null;
    visualDoNotUse?: string | null;
  };
  trendSignals?: TrendSignals;
  reelPlanningContext?: ReelPlanningContext | null;
  personaStyle?: string | null;
  personaPersonality?: string | null;
  personaFaceImageUrl?: string | null;
};

function hasAnyTrendSignals(signals?: TrendSignals | null): boolean {
  if (!signals) return false;

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

export async function POST(req: NextRequest) {
  try {
    const body: ProcessReelBody = await req.json();

    if (!body.jobId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "jobId and userId are required.",
        },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("generation_jobs")
      .update({
        status: "processing",
        error_message: null,
      })
      .eq("id", body.jobId)
      .eq("user_id", body.userId);

    const imageResult = await generateImageContent({
      personaName: body.personaName,
      contentType: "story",
      referenceImageUrl: body.personaFaceImageUrl ?? body.faceImageUrl ?? null,
      referenceImageUrls:
        body.personaFaceImageUrl
          ? [body.personaFaceImageUrl]
          : body.faceImageUrl
          ? [body.faceImageUrl]
          : [],
      identityLock: body.identityLock ?? true,
      allureMode: body.allureMode ?? false,
      niche: body.niche ?? null,
      style: body.personaStyle ?? null,
      personality: body.personaPersonality ?? null,
      advancedNotes: body.advancedPromptPayload?.advancedNotes ?? null,
      brandDirection: body.advancedPromptPayload?.brandDirection ?? null,
      brandKeywords: body.advancedPromptPayload?.brandKeywords ?? null,
      visualDoNotUse: body.advancedPromptPayload?.visualDoNotUse ?? null,
      planTitle: body.planTitle ?? null,
      planDay: body.planDay ?? null,
      planType: body.planType ?? null,
      trendSignals: hasAnyTrendSignals(body.trendSignals)
        ? {
            hooks: body.trendSignals!.hooks,
            audioMoods: body.trendSignals!.audioMoods,
            formats: body.trendSignals!.formats,
            shotPatterns: body.trendSignals!.shotPatterns,
            ctas: body.trendSignals!.ctas,
            hashtags: body.trendSignals!.hashtags,
            summary: body.trendSignals!.summary,
          }
        : null,
      smartControls: body.smartControls ?? undefined,
      smartControlsPromptBlock: null,
    });

    const reelPromptParts = [
      body.planTitle ? `Create a vertical social reel about: ${body.planTitle}` : null,
      body.reelPlanningContext?.hookOptions?.[0]
        ? `Hook style: ${body.reelPlanningContext.hookOptions[0]}`
        : null,
      body.reelPlanningContext?.audioDirection
        ? `Audio mood: ${body.reelPlanningContext.audioDirection}`
        : null,
      body.smartControls?.look ? `Visual look: ${body.smartControls.look}` : null,
      body.smartControls?.motion ? `Motion feel: ${body.smartControls.motion}` : null,
      "Vertical 9:16 social media reel.",
      "Natural motion, realistic face consistency, single continuous shot.",
      "No scene cuts. No face distortion. Keep identity stable.",
    ];

    const videoResult = await generateVideoContent({
      prompt: reelPromptParts.filter(Boolean).join(" "),
      startImageUrl: imageResult.imageUrl,
      duration: 5,
      generateAudio: false,
      aspectRatio: "9:16",
    });

    const captionParts = [
      "Generated reel with Kling V3",
      body.reelPlanningContext?.hookOptions?.[0]
        ? `Hook: ${body.reelPlanningContext.hookOptions[0]}`
        : null,
      body.reelPlanningContext?.audioDirection
        ? `Audio mood: ${body.reelPlanningContext.audioDirection}`
        : null,
      body.smartControls?.look ? `Look: ${body.smartControls.look}` : null,
      body.smartControls?.motion ? `Motion: ${body.smartControls.motion}` : null,
    ];

    const finalTitle = `${body.personaName || "Persona"} Reel`;
    const finalCaption = captionParts.filter(Boolean).join(" | ");

    await supabaseAdmin
      .from("generation_jobs")
      .update({
        status: "completed",
        image_url: imageResult.imageUrl,
        video_url: videoResult.videoUrl,
        thumbnail_url: videoResult.thumbnailUrl,
        title: finalTitle,
        caption: finalCaption,
        error_message: null,
      })
      .eq("id", body.jobId)
      .eq("user_id", body.userId);

    await supabaseAdmin.from("generated_content").insert({
      user_id: body.userId,
      persona_id: body.personaType === "custom" ? body.personaId ?? null : null,
      title: finalTitle,
      caption: finalCaption,
      content_type: "reel",
      asset_kind: "video",
      aspect_ratio: "9:16",
      type: "reel",
      format: "reel",
      video_url: videoResult.videoUrl,
      thumbnail_url: videoResult.thumbnailUrl,
      status: "ready",
      prompt: reelPromptParts.filter(Boolean).join(" "),
    });

    return NextResponse.json({
      success: true,
      status: "completed",
      jobId: body.jobId,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown process-reel error";

    try {
      const clonedReq = req.clone();
      const body = (await clonedReq.json()) as Partial<ProcessReelBody>;

      if (body?.jobId && body?.userId) {
        await supabaseAdmin
          .from("generation_jobs")
          .update({
            status: "failed",
            error_message: message,
          })
          .eq("id", body.jobId)
          .eq("user_id", body.userId);
      }
    } catch {}

    return NextResponse.json(
      {
        success: false,
        error: "PROCESS_REEL_FAILED",
        message,
      },
      { status: 500 }
    );
  }
}
