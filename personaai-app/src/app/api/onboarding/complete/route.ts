import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  generateMonthlyCalendar,
  getCalendarMonthString,
} from "@/lib/onboarding/calendar-generator";
import type { InfluencerCategory } from "@/types/category";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("category")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.category) {
      return NextResponse.json(
        { error: "Category is required before completion." },
        { status: 400 }
      );
    }

    const category = profile.category as InfluencerCategory;
    const calendarMonth = getCalendarMonthString();
    const rows = generateMonthlyCalendar(category).map((row) => ({
      user_id: user.id,
      calendar_month: calendarMonth,
      ...row,
    }));

    const { error: deleteError } = await supabase
      .from("user_content_calendar")
      .delete()
      .eq("user_id", user.id)
      .eq("calendar_month", calendarMonth);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from("user_content_calendar")
      .insert(rows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("user_profile")
      .update({
        onboarding_step: 3,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      redirectTo: "/studio",
      createdCount: rows.length,
      calendarMonth,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
