import type { SupabaseClient } from "@supabase/supabase-js";

type PackId = "small" | "medium" | "large";

const PACK_CREDITS: Record<PackId, number> = {
  small: 5,
  medium: 10,
  large: 25,
};

export async function handleCreditPurchase(
  userId: string,
  packId: PackId,
  stripePaymentIntentId: string,
  supabase: SupabaseClient
): Promise<void> {
  const credits = PACK_CREDITS[packId];
  if (!credits) throw new Error(`Unknown pack: ${packId}`);

  const { data: existing } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("stripe_payment_intent", stripePaymentIntentId)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: credits,
    p_pack_id: packId,
    p_stripe_payment_intent: stripePaymentIntentId,
  });

  if (error) throw new Error(`add_credits failed: ${error.message}`);
}

export async function handlePlanUpgrade(
  userId: string,
  newPlanId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({ plan_id: newPlanId, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");

  if (subError) throw new Error(`Subscription update failed: ${subError.message}`);

  const { data: newPlan } = await supabase
    .from("plans")
    .select("storage_duration_hours")
    .eq("id", newPlanId)
    .single();

  if (newPlan) {
    const newExpiry = new Date(
      Date.now() + (newPlan.storage_duration_hours as number) * 3_600_000
    ).toISOString();

    await supabase
      .from("generated_content")
      .update({ storage_expires_at: newExpiry })
      .eq("user_id", userId)
      .in("status", ["ready", "auto_pending", "previewed"])
      .lt("storage_expires_at", newExpiry);
  }

  await supabase.rpc("unlock_plan_days_for_date", {
    p_target_date: new Date().toISOString().slice(0, 10),
  });
}

export async function handlePlanDowngrade(
  userId: string,
  newPlanId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: newPlan, error: planError } = await supabase
    .from("plans")
    .select("max_influencers, max_content_plans")
    .eq("id", newPlanId)
    .single();

  if (planError || !newPlan) throw new Error("Plan not found");

  const { error: subError } = await supabase
    .from("subscriptions")
    .update({
      plan_id: newPlanId,
      downgrade_to_plan_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "active");

  if (subError) throw new Error(`Subscription update failed: ${subError.message}`);

  const { count: activeCount } = await supabase
    .from("influencers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_archived", false);

  const excess = (activeCount ?? 0) - (newPlan.max_influencers as number);

  if (excess > 0) {
    const { data: toArchive } = await supabase
      .from("influencers")
      .select("id")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(excess);

    if (toArchive && toArchive.length > 0) {
      await supabase
        .from("influencers")
        .update({
          is_archived: true,
          archived_reason: "plan_downgrade",
          updated_at: new Date().toISOString(),
        })
        .in("id", toArchive.map((i: { id: string }) => i.id));
    }
  }

  const maxPlans = newPlan.max_content_plans as number | null;

  if (maxPlans !== null) {
    const { data: plansToArchive } = await supabase
      .from("content_plans")
      .select("id")
      .eq("user_id", userId)
      .neq("plan_status", "archived")
      .order("created_at", { ascending: false })
      .range(maxPlans, 9999);

    if (plansToArchive && plansToArchive.length > 0) {
      await supabase
        .from("content_plans")
        .update({ plan_status: "archived", updated_at: new Date().toISOString() })
        .in("id", plansToArchive.map((p: { id: string }) => p.id));
    }
  }

  if (newPlanId === "free") {
    const { data: queuedAuto } = await supabase
      .from("generated_content")
      .select("id")
      .eq("user_id", userId)
      .eq("triggered_by", "auto_system")
      .eq("status", "queued");

    if (queuedAuto && queuedAuto.length > 0) {
      const ids = queuedAuto.map((r: { id: string }) => r.id);

      await supabase
        .from("generation_queue")
        .update({
          failed_at: new Date().toISOString(),
          error: "Plan downgrade: auto-gen disabled",
        })
        .in("generated_content_id", ids);

      await supabase
        .from("generated_content")
        .update({
          status: "failed",
          error_message: "Plan downgrade",
          updated_at: new Date().toISOString(),
        })
        .in("id", ids);
    }
  }
}
