import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";
import { generateImageContent } from "@/lib/generation/image";
import { generateVideoContent } from "@/lib/generation/video";

async function uploadRemoteVideoToSupabaseStorage(params: {
  remoteUrl: string;
  userId: string;
  jobId: string;
}) {
  const { remoteUrl, userId, jobId } = params;

  const response = await fetch(remoteUrl);

  if (!response.ok) {
    throw new Error(`Failed to download remote video: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = `${userId}/${jobId}.mp4`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("generated-reels")
    .upload(filePath, buffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("generated-reels")
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: publicUrlData.publicUrl,
  };
}

type ClaimedJobRow = {
  id: string;
  user_id: string;
  persona_id: string | null;
  content_type: string;
  status: string;
  prompt: string | null;
  title: string | null;
  caption: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
  attempt_count: number;
};

type JobPayload = {
  userId?: string;
  personaId?: string | null;
  personaName?: string | null;
  personaType?: "preset" | "custom" | string | null;
  contentType?: string | null;
  planTitle?: string | null;
  planDay?: string | null;
  planType?: string | null;
  niche?: string | null;
  region?: string | null;
  smartControls?: {
    look?: string | null;
    motion?: string | null;
    pacing?: string | null;
  } | null;
  faceImageUrl?: string | null;
  coverImageUrl?: string | null;
  references?: string[];
  identityLock?: boolean;
  allureMode?: boolean;
  advancedPromptPayload?: {
    advancedNotes?: string | null;
    brandDirection?: string | null;
    brandKeywords?: string[] | null;
    visualDoNotUse?: string[] | null;
  } | null;
  trendSignals?: unknown;
  reelPlanningContext?: {
    hookOptions?: string[];
    audioDirection?: string | null;
  } | null;
  personaStyle?: string | null;
  personaPersonality?: string | null;
  personaFaceImageUrl?: string | null;
};

const MAX_RETRIES = 3;

export async function GET(req: NextRequest) {
  let claimed: ClaimedJobRow | null = null;

  try {

    const { data: claimedRows, error: claimError } = await supabaseAdmin.rpc(
      "claim_next_reel_job"
    );

    if (claimError) {
      return NextResponse.json(
        {
          success: false,
          error: "CLAIM_FAILED",
          message: claimError.message,
        },
        { status: 500 }
      );
    }

    claimed = (claimedRows?.[0] ?? null) as ClaimedJobRow | null;

    if (!claimed) {
      return NextResponse.json({
        success: true,
        message: "No queued reel jobs.",
      });
    }

    const { data: fullJob, error: fullJobError } = await supabaseAdmin
      .from("generation_jobs")
      .select("*")
      .eq("id", claimed.id)
      .eq("user_id", claimed.user_id)
      .maybeSingle();

    if (fullJobError || !fullJob) {
      throw new Error(fullJobError?.message ?? "Claimed job not found.");
    }

    const payload = (fullJob.payload ?? null) as JobPayload | null;

    if (!payload) {
      throw new Error("Job payload missing.");
    }

    const referenceImageUrl =
      payload.personaFaceImageUrl ??
      payload.faceImageUrl ??
      payload.coverImageUrl ??
      null;

    const referenceImageUrls = [
      payload.personaFaceImageUrl,
      payload.faceImageUrl,
      payload.coverImageUrl,
      ...(Array.isArray(payload.references) ? payload.references : []),
    ].filter(Boolean) as string[];

    const imageResult = await generateImageContent({
      personaName: payload.personaName ?? "Persona",
      contentType: "story",
      referenceImageUrl,
      referenceImageUrls,
      identityLock: payload.identityLock ?? true,
      allureMode: payload.allureMode ?? false,
      niche: payload.niche ?? null,
      style: payload.personaStyle ?? null,
      personality: payload.personaPersonality ?? null,
      advancedNotes: payload.advancedPromptPayload?.advancedNotes ?? null,
      brandDirection: payload.advancedPromptPayload?.brandDirection ?? null,
brandKeywords: Array.isArray(payload.advancedPromptPayload?.brandKeywords)
  ? payload.advancedPromptPayload?.brandKeywords.join(", ")
  : payload.advancedPromptPayload?.brandKeywords ?? null,
visualDoNotUse: Array.isArray(payload.advancedPromptPayload?.visualDoNotUse)
  ? payload.advancedPromptPayload?.visualDoNotUse.join(", ")
  : payload.advancedPromptPayload?.visualDoNotUse ?? null,
      planTitle: payload.planTitle ?? null,
      planDay: payload.planDay ?? null,
      planType: payload.planType ?? null,
      trendSignals: payload.trendSignals ?? null,
      smartControls: payload.smartControls ?? undefined,
      smartControlsPromptBlock: null,
    });

    const reelPromptParts = [
      payload.planTitle
        ? `Create a vertical social reel about: ${payload.planTitle}`
        : null,
      payload.reelPlanningContext?.hookOptions?.[0]
        ? `Hook style: ${payload.reelPlanningContext.hookOptions[0]}`
        : null,
      payload.reelPlanningContext?.audioDirection
        ? `Audio mood: ${payload.reelPlanningContext.audioDirection}`
        : null,
      payload.smartControls?.look
        ? `Visual look: ${payload.smartControls.look}`
        : null,
      payload.smartControls?.motion
        ? `Motion feel: ${payload.smartControls.motion}`
        : null,
      "Vertical 9:16 social media reel.",
      "Natural motion, realistic face consistency, single continuous shot.",
      "No scene cuts. No face distortion. Keep identity stable.",
    ];

    const finalPrompt = reelPromptParts.filter(Boolean).join(" ");

    const videoResult = await generateVideoContent({    
  prompt: finalPrompt,
      startImageUrl: imageResult.imageUrl,
      duration: 5,
      generateAudio: false,
      aspectRatio: "9:16",
    });

const storedVideo = await uploadRemoteVideoToSupabaseStorage({
  remoteUrl: videoResult.videoUrl,
  userId: claimed.user_id,
  jobId: claimed.id,
});

    const finalTitle = `${payload.personaName || "Persona"} Reel`;

    const finalCaption = [
      "Generated reel",
      payload.reelPlanningContext?.hookOptions?.[0]
        ? `Hook: ${payload.reelPlanningContext.hookOptions[0]}`
        : null,
      payload.reelPlanningContext?.audioDirection
        ? `Audio mood: ${payload.reelPlanningContext.audioDirection}`
        : null,
      payload.smartControls?.look
        ? `Look: ${payload.smartControls.look}`
        : null,
      payload.smartControls?.motion
        ? `Motion: ${payload.smartControls.motion}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const nowIso = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("generation_jobs")
      .update({
        status: "completed",
        image_url: imageResult.imageUrl,
video_url: storedVideo.publicUrl,
        thumbnail_url: videoResult.thumbnailUrl,
        title: finalTitle,
        caption: finalCaption,
        error_message: null,
        processed_at: nowIso,
        locked_at: null,
        updated_at: nowIso,
      })
      .eq("id", claimed.id)
      .eq("user_id", claimed.user_id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: generatedInsertError } = await supabaseAdmin
      .from("generated_content")
      .insert({
        user_id: claimed.user_id,
        persona_id:
          payload.personaType === "custom" ? payload.personaId ?? null : null,
        title: finalTitle,
        caption: finalCaption,
        content_type: "reel",
        asset_kind: "video",
        aspect_ratio: "9:16",
        type: "reel",
        format: "reel",
video_url: storedVideo.publicUrl,
        thumbnail_url: videoResult.thumbnailUrl,
        status: "ready",
        prompt: finalPrompt,
      });

    if (generatedInsertError) {
      throw new Error(generatedInsertError.message);
    }

    return NextResponse.json({
      success: true,
      processedJobId: claimed.id,
      status: "completed",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown worker error";

    console.error("PROCESS_REELS_WORKER_ERROR", message);

    if (claimed) {
      const shouldFailPermanently = claimed.attempt_count >= MAX_RETRIES;

      await supabaseAdmin
        .from("generation_jobs")
        .update({
          status: shouldFailPermanently ? "failed" : "queued",
          error_message: message,
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimed.id)
        .eq("user_id", claimed.user_id);
    }

    return NextResponse.json(
      {
        success: false,
        error: "WORKER_FAILED",
        message,
      },
      { status: 500 }
    );
  }
}
