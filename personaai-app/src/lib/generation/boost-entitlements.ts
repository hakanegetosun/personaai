import { supabaseAdmin } from "@/lib/supabase/service";
import type { BoostMode } from "@/lib/generation/boost-routing";

export function getUsageMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function getDefaultMonthlyEntitlements(planId: string | null | undefined): {
  freeAllureRemaining: number;
  freeConsistencyRemaining: number;
} {
  const normalized = (planId ?? "").toLowerCase();

  if (normalized.includes("agency")) {
    return { freeAllureRemaining: 2, freeConsistencyRemaining: 2 };
  }

  if (normalized.includes("creator")) {
    return { freeAllureRemaining: 1, freeConsistencyRemaining: 1 };
  }

  return { freeAllureRemaining: 0, freeConsistencyRemaining: 0 };
}

export async function getOrCreateBoostEntitlement(params: {
  userId: string;
  planId: string | null | undefined;
  monthKey?: string;
}) {
  const monthKey = params.monthKey ?? getUsageMonthKey();

  const { data: existing, error: readError } = await supabaseAdmin
    .from("user_boost_entitlements")
    .select("id, user_id, month_key, free_allure_remaining, free_consistency_remaining")
    .eq("user_id", params.userId)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read boost entitlement: ${readError.message}`);
  }

  if (existing) {
    return existing;
  }

  const defaults = getDefaultMonthlyEntitlements(params.planId);

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("user_boost_entitlements")
    .insert({
      user_id: params.userId,
      month_key: monthKey,
      free_allure_remaining: defaults.freeAllureRemaining,
      free_consistency_remaining: defaults.freeConsistencyRemaining,
    })
    .select("id, user_id, month_key, free_allure_remaining, free_consistency_remaining")
    .single();

  if (insertError || !inserted) {
    throw new Error(`Failed to create boost entitlement: ${insertError?.message ?? "unknown error"}`);
  }

  return inserted;
}

export function hasFreeBoostAvailable(
  mode: BoostMode,
  entitlement: {
    free_allure_remaining: number;
    free_consistency_remaining: number;
  }
): boolean {
  if (mode === "allure_boost") {
    return entitlement.free_allure_remaining > 0;
  }

  if (mode === "extra_consistency") {
    return entitlement.free_consistency_remaining > 0;
  }

  return false;
}

export async function consumeFreeBoost(params: {
  entitlementId: string;
  mode: BoostMode;
}): Promise<void> {
  if (params.mode === "standard") return;

  if (params.mode === "allure_boost") {
    const { error } = await supabaseAdmin.rpc("decrement_boost_entitlement", {
      entitlement_id_input: params.entitlementId,
      field_name_input: "free_allure_remaining",
    });

    if (error) {
      throw new Error(`Failed to consume allure boost: ${error.message}`);
    }

    return;
  }

  const { error } = await supabaseAdmin.rpc("decrement_boost_entitlement", {
    entitlement_id_input: params.entitlementId,
    field_name_input: "free_consistency_remaining",
  });

  if (error) {
    throw new Error(`Failed to consume consistency boost: ${error.message}`);
  }
}
