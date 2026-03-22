import type { SupabaseClient } from "@supabase/supabase-js";

export type ContentType = "post" | "story" | "reel";

export type EnforcementResult =
  | {
      allowed:          true;
      quotaSource:      "subscription" | "credits";
      creditsRequired:  number;
    }
  | {
      allowed:  false;
      reason:   string;
      code:     string;
    };

interface Plan {
  id:                    string;
  weekly_post_limit:     number;
  weekly_story_limit:    number;
  weekly_reel_limit:     number;
  daily_post_limit:      number;
  daily_story_limit:     number;
  daily_reel_limit:      number;
  daily_total_limit:     number;
  content_unlock_enabled: boolean;
  is_lifetime_limited:   boolean;
}

interface PlanDay {
  id:              string;
  is_unlocked:     boolean;
  day_number:      number;
  content_type:    string;
  content_plan_id: string;
}

interface DailyCounters {
  posts_generated:   number;
  stories_generated: number;
  reels_generated:   number;
  total_generated:   number;
}

interface WeeklyCounters {
  posts_generated:   number;
  stories_generated: number;
  reels_generated:   number;
}

export function getUTCMondayDate(): string {
  const now  = new Date();
  const day  = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const mon  = new Date(now);
  mon.setUTCDate(now.getUTCDate() - diff);
  return mon.toISOString().slice(0, 10);
}

export function getUTCDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function enforceGenerationRequest(
  userId:      string,
  planDayId:   string,
  contentType: ContentType,
  supabase:    SupabaseClient
): Promise<EnforcementResult> {

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  const planId = sub?.plan_id ?? "free";

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single<Plan>();

  if (planError || !plan) {
    return { allowed: false, reason: "Plan configuration not found", code: "PLAN_NOT_FOUND" };
  }

  if (contentType === "reel" && plan.weekly_reel_limit === 0) {
    return {
      allowed: false,
      reason:  "Reels are not available on your current plan. Upgrade to PRO or CREATOR.",
      code:    "FEATURE_NOT_IN_PLAN",
    };
  }

  const { data: planDay, error: dayError } = await supabase
    .from("plan_days")
    .select("id, is_unlocked, day_number, content_type, content_plan_id")
    .eq("id", planDayId)
    .single<PlanDay>();

  if (dayError || !planDay) {
    return { allowed: false, reason: "Plan day not found", code: "DAY_NOT_FOUND" };
  }

  if (planDay.content_type !== contentType) {
    return { allowed: false, reason: "Content type mismatch for this day", code: "TYPE_MISMATCH" };
  }

  if (plan.content_unlock_enabled && !planDay.is_unlocked) {
    return {
      allowed: false,
      reason:  `Day ${planDay.day_number} is not unlocked yet. Check back tomorrow.`,
      code:    "DAY_LOCKED",
    };
  }

  const { data: existing } = await supabase
    .from("generated_content")
    .select("id, status")
    .eq("plan_day_id", planDayId)
    .eq("content_type", contentType)
    .in("status", ["auto_pending", "ready", "previewed", "downloaded", "queued", "generating"])
    .maybeSingle();

  if (existing) {
    return {
      allowed: false,
      reason:  "Content already exists for this day",
      code:    "DUPLICATE",
    };
  }

  const today     = getUTCDateString();
  const weekStart = getUTCMondayDate();

  const { data: daily } = await supabase
    .from("daily_usage_counters")
    .select("posts_generated, stories_generated, reels_generated, total_generated")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle<DailyCounters>();

  const d: DailyCounters = daily ?? {
    posts_generated:   0,
    stories_generated: 0,
    reels_generated:   0,
    total_generated:   0,
  };

  const { data: weekly } = await supabase
    .from("usage_counters")
    .select("posts_generated, stories_generated, reels_generated")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle<WeeklyCounters>();

  const w: WeeklyCounters = weekly ?? {
    posts_generated:   0,
    stories_generated: 0,
    reels_generated:   0,
  };

  const dailyTypeCount: Record<ContentType, number> = {
    post:  d.posts_generated,
    story: d.stories_generated,
    reel:  d.reels_generated,
  };

  const dailyTypeLimit: Record<ContentType, number> = {
    post:  plan.daily_post_limit,
    story: plan.daily_story_limit,
    reel:  plan.daily_reel_limit,
  };

  const weeklyTypeCount: Record<ContentType, number> = {
    post:  w.posts_generated,
    story: w.stories_generated,
    reel:  w.reels_generated,
  };

  const weeklyTypeLimit: Record<ContentType, number> = {
    post:  plan.weekly_post_limit,
    story: plan.weekly_story_limit,
    reel:  plan.weekly_reel_limit,
  };

  const dailyTypeOk  = dailyTypeCount[contentType]  < dailyTypeLimit[contentType];
  const dailyTotalOk = d.total_generated             < plan.daily_total_limit;
  const weeklyOk     = weeklyTypeCount[contentType]  < weeklyTypeLimit[contentType];

  const subscriptionOk = plan.is_lifetime_limited
    ? weeklyOk && dailyTypeOk
    : dailyTypeOk && dailyTotalOk && weeklyOk;

  if (subscriptionOk) {
    return { allowed: true, quotaSource: "subscription", creditsRequired: 0 };
  }

  const creditCost = contentType === "reel" ? 2 : 1;

  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  const balance = creditsRow?.balance ?? 0;

  if (balance >= creditCost) {
    return { allowed: true, quotaSource: "credits", creditsRequired: creditCost };
  }

  if (!weeklyOk) {
    return {
      allowed: false,
      reason:  `Weekly ${contentType} limit reached (${weeklyTypeLimit[contentType]}/week). Purchase credits to continue.`,
      code:    "WEEKLY_LIMIT_EXCEEDED",
    };
  }

  if (!dailyTypeOk) {
    return {
      allowed: false,
      reason:  `Daily ${contentType} limit reached (${dailyTypeLimit[contentType]}/day). Try again tomorrow.`,
      code:    "DAILY_TYPE_LIMIT",
    };
  }

  return {
    allowed: false,
    reason:  `Daily limit reached (${plan.daily_total_limit}/day). Purchase credits or try again tomorrow.`,
    code:    "DAILY_TOTAL_LIMIT",
  };
}

export async function consumeAutoQuota(
  contentId: string,
  userId:    string,
  supabase:  SupabaseClient
): Promise<void> {
  const { data: gc, error: gcError } = await supabase
    .from("generated_content")
    .select("id, status, content_type, quota_consumed, plan_day_id")
    .eq("id", contentId)
    .eq("user_id", userId)
    .single<{
      id: string;
      status: string;
      content_type: ContentType;
      quota_consumed: boolean;
      plan_day_id: string;
    }>();

  if (gcError || !gc) throw new Error("Content not found");
  if (gc.quota_consumed)        return;
  if (gc.status !== "auto_pending") return;

  const check = await enforceGenerationRequest(
    userId,
    gc.plan_day_id,
    gc.content_type,
    supabase
  );

  if (!check.allowed) {
    const err = new Error(check.reason) as Error & { code: string };
    err.code = check.code;
    throw err;
  }

  const today      = getUTCDateString();
  const weekStart  = getUTCMondayDate();
  const creditCost = check.creditsRequired;

  const { error: rpcError } = await supabase.rpc("consume_auto_quota", {
    p_content_id:   contentId,
    p_user_id:      userId,
    p_content_type: gc.content_type,
    p_date:         today,
    p_week_start:   weekStart,
    p_quota_source: check.quotaSource,
    p_credits_used: creditCost,
    p_new_status:   "previewed",
  });

  if (rpcError) throw new Error(`consume_auto_quota failed: ${rpcError.message}`);
}
