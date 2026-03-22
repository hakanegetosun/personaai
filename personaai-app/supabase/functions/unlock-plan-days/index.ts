import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (_req: Request): Promise<Response> => {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ----------------------------------------------------------------
  // Compute today's date in UTC
  // The RPC unlocks any plan_day where:
  //   content_plan.started_at::DATE + (day_number - 1 days) <= today + 1
  // i.e. days that are due today or already overdue get unlocked.
  // Running at 00:05 UTC means "today" is the new calendar day.
  // ----------------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10);

  console.log(`unlock-plan-days: running for date=${today}`);

  const { data, error } = await supabase.rpc("unlock_plan_days_for_date", {
    p_target_date: today,
  });

  if (error) {
    console.error("unlock_plan_days_for_date RPC failed:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const unlocked = data as number;

  console.log(`unlock-plan-days: complete date=${today} unlocked=${unlocked}`);

  return new Response(
    JSON.stringify({ date: today, unlocked }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
