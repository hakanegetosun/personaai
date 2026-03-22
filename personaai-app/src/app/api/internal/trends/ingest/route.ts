import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

type TrendType = "hook" | "audio" | "format" | "shot_pattern" | "cta" | "hashtag";
type TrendPlatform = "tiktok" | "instagram";

type TrendSnapshotInput = {
  platform: TrendPlatform;
  region?: string;
  niche: string;
  trend_type: TrendType;
  title: string;
  signal_strength?: number;
  summary?: string | null;
  raw_data?: Record<string, unknown>;
  captured_at?: string;
};

type IngestBody = {
  snapshots?: TrendSnapshotInput[];
};

function normalizeSnapshot(item: TrendSnapshotInput) {
  return {
    platform: item.platform,
    region: (item.region ?? "global").trim() || "global",
    niche: item.niche.trim().toLowerCase(),
    trend_type: item.trend_type,
    title: item.title.trim(),
    signal_strength: Number(item.signal_strength ?? 0),
    summary: item.summary ?? null,
    raw_data: item.raw_data ?? {},
    captured_at: item.captured_at ?? new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const internalSecret = req.headers.get("x-internal-secret");

    if (!process.env.INTERNAL_CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "MISSING_INTERNAL_CRON_SECRET" },
        { status: 500 }
      );
    }

    if (internalSecret !== process.env.INTERNAL_CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body: IngestBody = await req.json().catch(() => ({}));
    const snapshots = Array.isArray(body.snapshots) ? body.snapshots : [];

    if (snapshots.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        message: "No snapshots provided.",
      });
    }

    const normalized = snapshots
      .filter(
        (item) =>
          item &&
          item.platform &&
          item.niche &&
          item.trend_type &&
          item.title
      )
      .map(normalizeSnapshot);

    if (normalized.length === 0) {
      return NextResponse.json(
        { success: false, error: "NO_VALID_SNAPSHOTS" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("trend_snapshots")
      .insert(normalized);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "INSERT_FAILED",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: normalized.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
