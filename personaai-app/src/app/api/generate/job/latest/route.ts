import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "userId is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generation_jobs")
      .select("*")
      .eq("user_id", userId)
      .eq("content_type", "reel")
      .in("status", ["queued", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "LATEST_JOB_FETCH_FAILED",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: data
        ? {
            id: data.id,
            status: data.status,
            title: data.title,
            caption: data.caption,
            image_url: data.image_url,
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url,
            error_message: data.error_message,
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
