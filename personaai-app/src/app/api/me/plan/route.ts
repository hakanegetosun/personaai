import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/service";

interface PlanRow {
  id: string;
  display_name: string;
  daily_discover_limit: number | null;
  max_active_personas: number | null;
  custom_persona_enabled: boolean | null;
  premium_pool_access: boolean | null;
  priority_level: number | null;
  weekly_post_limit: number | null;
  weekly_story_limit: number | null;
  weekly_reel_limit: number | null;
  storage_duration_hours: number | null;
}

interface SubscriptionRow {
  plan_id: string;
  billing_interval: "monthly" | "yearly" | null;
  status: string;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_id, billing_interval, status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>();

    const activePlanId = subscription?.plan_id ?? "free";

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select(`
        id,
        display_name,
        daily_discover_limit,
        max_active_personas,
        custom_persona_enabled,
        premium_pool_access,
        priority_level,
        weekly_post_limit,
        weekly_story_limit,
        weekly_reel_limit,
        storage_duration_hours
      `)
      .eq("id", activePlanId)
      .single<PlanRow>();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plan not found", code: "PLAN_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        userId: user.id,
        planId: plan.id,
        displayName: plan.display_name,
        billingInterval: subscription?.billing_interval ?? null,
        subscriptionStatus: subscription?.status ?? "free",

        dailyDiscoverLimit: plan.daily_discover_limit ?? 0,
        maxActivePersonas: plan.max_active_personas ?? 1,
        customPersonaEnabled: plan.custom_persona_enabled ?? false,
        premiumPoolAccess: plan.premium_pool_access ?? false,
        priorityLevel: plan.priority_level ?? 5,

        weeklyPostLimit: plan.weekly_post_limit ?? 0,
        weeklyStoryLimit: plan.weekly_story_limit ?? 0,
        weeklyReelLimit: plan.weekly_reel_limit ?? 0,
        storageDurationHours: plan.storage_duration_hours ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/me/plan error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
