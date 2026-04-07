import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get("jobId");
    const userId = req.nextUrl.searchParams.get("userId");

    if (!jobId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "jobId and userId are required.",
        },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabaseAdmin
      .from("generation_jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "JOB_FETCH_FAILED",
          message: error.message,
        },
        { status: 500 }
      );
    }

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "JOB_NOT_FOUND",
          message: "Generation job not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        title: job.title,
        caption: job.caption,
        image_url: job.image_url,
        video_url: job.video_url,
        thumbnail_url: job.thumbnail_url,
        error_message: job.error_message,
        created_at: job.created_at,
        updated_at: job.updated_at,
      },
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
