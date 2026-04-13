import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RequestBody = {
  display_name?: string | null;
  age?: number | string | null;
};

function parseAge(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed < 0 || parsed > 120) {
    return null;
  }

  return parsed;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as RequestBody;

    const displayName =
      typeof body.display_name === "string" ? body.display_name.trim() : "";

    const age = parseAge(body.age);

    if (body.age !== null && body.age !== undefined && body.age !== "" && age === null) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("user_profile")
      .update({
        display_name: displayName || null,
        age,
        onboarding_step: 3,
        onboarding_completed: false,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      redirectTo: "/onboarding",
      onboardingStep: 3,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
