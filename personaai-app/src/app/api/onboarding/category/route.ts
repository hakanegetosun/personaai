import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isInfluencerCategory } from "@/types/category";

type RequestBody = {
  category?: string;
};

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
    const category = body.category;

    if (!isInfluencerCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("user_profile")
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          category,
          onboarding_step: 2,
          onboarding_completed: false,
        },
        {
          onConflict: "id",
        }
      );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      redirectTo: "/onboarding",
      onboardingStep: 2,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
