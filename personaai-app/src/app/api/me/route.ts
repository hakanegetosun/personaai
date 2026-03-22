import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({
    user,
    error: error?.message ?? null,
  });
}
