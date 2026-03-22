import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AutoTarget {
  plan_day_id:   string;
  user_id:       string;
  content_type:  string;
  plan_id:       string;
  influencer_id: string;
}

interface PlanDayRow {
  theme:           string | null;
  hook_suggestion: string | null;
  caption_draft:   string | null;
}

interface CharacterModelRow {
  replicate_model_version:   string | null;
  lora_weights_url:          string | null;
  positive_prompt_prefix:    string | null;
  negative_prompt:           string | null;
  training_trigger_word:     string | null;
  training_status:           string;
  face_similarity_threshold: number;
}

interface InfluencerRow {
  style_notes:      string | null;
  personality_tags: string[] | null;
}

interface InsertedContent {
  id: string;
}

interface JobResult {
  plan_day_id:  string;
  user_id:      string;
  content_type: string;
  status:       "queued" | "skipped";
  reason?:      string;
  content_id?:  string;
}

async function processTarget(
  target: AutoTarget,
  supabase: SupabaseClient
): Promise<JobResult> {
  const base: Pick<JobResult, "plan_day_id" | "user_id" | "content_type"> = {
    plan_day_id:  target.plan_day_id,
    user_id:      target.user_id,
    content_type: target.content_type,
  };

  // ----------------------------------------------------------------
  // Load plan_day
  // ----------------------------------------------------------------
  const { data: dayData, error: dayError } = await supabase
    .from("plan_days")
    .select("theme, hook_suggestion, caption_draft")
    .eq("id", target.plan_day_id)
    .single<PlanDayRow>();

  if (dayError || !dayData) {
    return {
      ...base,
      status: "skipped",
      reason: `plan_day fetch failed: ${dayError?.message ?? "no data"}`,
    };
  }

  // ----------------------------------------------------------------
  // Load character model — must be ready
  // ----------------------------------------------------------------
  const { data: cmData, error: cmError } = await supabase
    .from("character_models")
    .select(
      "replicate_model_version, lora_weights_url, positive_prompt_prefix, negative_prompt, training_trigger_word, training_status, face_similarity_threshold"
    )
    .eq("influencer_id", target.influencer_id)
    .single<CharacterModelRow>();

  if (cmError || !cmData) {
    return {
      ...base,
      status: "skipped",
      reason: `character_model fetch failed: ${cmError?.message ?? "no data"}`,
    };
  }

  if (cmData.training_status !== "ready") {
    return {
      ...base,
      status: "skipped",
      reason: `character_model training_status=${cmData.training_status}`,
    };
  }

  // ----------------------------------------------------------------
  // Load influencer for prompt enrichment
  // ----------------------------------------------------------------
  const { data: infData } = await supabase
    .from("influencers")
    .select("style_notes, personality_tags")
    .eq("id", target.influencer_id)
    .single<InfluencerRow>();

  // ----------------------------------------------------------------
  // Build prompt
  // ----------------------------------------------------------------
  const promptParts: string[] = [];
  if (cmData.positive_prompt_prefix)    promptParts.push(cmData.positive_prompt_prefix);
  if (dayData.theme)                     promptParts.push(dayData.theme);
  if (infData?.style_notes)              promptParts.push(infData.style_notes);
  if (infData?.personality_tags?.length) promptParts.push(infData.personality_tags.join(", "));
  if (cmData.training_trigger_word)      promptParts.push(cmData.training_trigger_word);

  const prompt = promptParts.join(", ");
  const seed   = Math.floor(Math.random() * 2 ** 32);

  const priority =
    target.plan_id === "creator" ? 1 :
    target.plan_id === "pro"     ? 5 : 9;

  // ----------------------------------------------------------------
  // Insert generated_content row
  // status = queued, triggered_by = auto_system, quota_consumed = false
  // quota is only consumed when user previews/downloads
  // ----------------------------------------------------------------
  const { data: gcData, error: gcError } = await supabase
    .from("generated_content")
    .insert({
      plan_day_id:          target.plan_day_id,
      user_id:              target.user_id,
      content_type:         target.content_type,
      triggered_by:         "auto_system",
      status:               "queued",
      quota_consumed:       false,
      prompt_used:          prompt,
      negative_prompt_used: cmData.negative_prompt ?? null,
      model_version_used:   cmData.replicate_model_version ?? null,
      seed_used:            seed,
      generation_params: {
        lora_weights_url:          cmData.lora_weights_url,
        face_similarity_threshold: cmData.face_similarity_threshold,
      },
    })
    .select("id")
    .single<InsertedContent>();

  if (gcError || !gcData) {
    return {
      ...base,
      status: "skipped",
      reason: `generated_content insert failed: ${gcError?.message ?? "no data"}`,
    };
  }

  // ----------------------------------------------------------------
  // Insert generation_queue job
  // ----------------------------------------------------------------
  const { error: queueError } = await supabase
    .from("generation_queue")
    .insert({
      generated_content_id: gcData.id,
      priority,
      scheduled_for:        new Date().toISOString(),
    });

  if (queueError) {
    await supabase
      .from("generated_content")
      .update({
        status:        "failed",
        error_message: "Queue insert failed during auto-generate cron",
        updated_at:    new Date().toISOString(),
      })
      .eq("id", gcData.id);

    return {
      ...base,
      status: "skipped",
      reason: `generation_queue insert failed: ${queueError.message}`,
    };
  }

  return {
    ...base,
    status:     "queued",
    content_id: gcData.id,
  };
}

Deno.serve(async (_req: Request): Promise<Response> => {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ----------------------------------------------------------------
  // Compute tomorrow's date in UTC
  // ----------------------------------------------------------------
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);

  console.log(`auto-generate: starting for date=${tomorrowDate}`);

  // ----------------------------------------------------------------
  // Fetch targets from DB function
  // Returns plan_days that: belong to active auto-gen plans,
  // are scheduled for tomorrow, and have no existing non-failed content
  // ----------------------------------------------------------------
  const { data: targets, error: targetError } = await supabase.rpc(
    "get_auto_generate_targets",
    { p_target_date: tomorrowDate }
  );

  if (targetError) {
    console.error("get_auto_generate_targets failed:", targetError.message);
    return new Response(
      JSON.stringify({ error: targetError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const rows = (targets as AutoTarget[]) ?? [];

  if (rows.length === 0) {
    console.log(`auto-generate: no targets for date=${tomorrowDate}`);
    return new Response(
      JSON.stringify({ date: tomorrowDate, queued: 0, skipped: 0, total: 0, results: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`auto-generate: ${rows.length} target(s) found for date=${tomorrowDate}`);

  // ----------------------------------------------------------------
  // Process all targets — allSettled so one failure doesn't block others
  // ----------------------------------------------------------------
  const settled = await Promise.allSettled(
    rows.map((target) => processTarget(target, supabase))
  );

  const results: JobResult[] = [];
  let queued  = 0;
  let skipped = 0;

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];

    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
      if (outcome.value.status === "queued") {
        queued++;
      } else {
        skipped++;
        console.warn(
          `auto-generate: skipped plan_day=${outcome.value.plan_day_id} reason=${outcome.value.reason}`
        );
      }
    } else {
      skipped++;
      const target = rows[i];
      console.error(
        `auto-generate: unhandled error for plan_day=${target.plan_day_id}:`,
        outcome.reason
      );
      results.push({
        plan_day_id:  target.plan_day_id,
        user_id:      target.user_id,
        content_type: target.content_type,
        status:       "skipped",
        reason:       String(outcome.reason),
      });
    }
  }

  console.log(
    `auto-generate: complete date=${tomorrowDate} total=${rows.length} queued=${queued} skipped=${skipped}`
  );

  return new Response(
    JSON.stringify({
      date:    tomorrowDate,
      total:   rows.length,
      queued,
      skipped,
      results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
