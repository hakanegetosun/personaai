import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BATCH_SIZE = 100;

interface ExpiredRow {
  id:             string;
  storage_bucket: string;
  storage_path:   string | null;
  user_id:        string;
  status:         string;
}

interface ExpireResult {
  id:      string;
  outcome: "deleted" | "no_file" | "error";
  reason?: string;
}

async function expireRow(
  row: ExpiredRow,
  supabase: ReturnType<typeof createClient>,
  now: string
): Promise<ExpireResult> {
  // ----------------------------------------------------------------
  // Delete file from Supabase Storage if a path exists.
  // If the file is already gone (e.g. manually deleted) that is fine —
  // we still mark the DB row as expired.
  // ----------------------------------------------------------------
  if (row.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(row.storage_bucket)
      .remove([row.storage_path]);

    if (storageError) {
      // Log but do not abort — attempt the DB update anyway so we don't
      // re-process this row forever. A subsequent run will clean up if
      // the storage delete is eventually consistent.
      console.error(
        `expire-content: storage delete failed id=${row.id} path=${row.storage_path}: ${storageError.message}`
      );
    }
  }

  // ----------------------------------------------------------------
  // Mark row as expired in the database
  // ----------------------------------------------------------------
  const { error: updateError } = await supabase
    .from("generated_content")
    .update({
      status:             "expired",
      storage_path:       null,
      storage_deleted_at: now,
      updated_at:         now,
    })
    .eq("id", row.id);

  if (updateError) {
    return {
      id:      row.id,
      outcome: "error",
      reason:  `DB update failed: ${updateError.message}`,
    };
  }

  return {
    id:      row.id,
    outcome: row.storage_path ? "deleted" : "no_file",
  };
}

Deno.serve(async (_req: Request): Promise<Response> => {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date().toISOString();

  console.log(`expire-content: running at=${now}`);

  // ----------------------------------------------------------------
  // Fetch up to BATCH_SIZE rows that have passed their storage_expires_at
  // and have not yet been deleted (storage_deleted_at IS NULL).
  // Only statuses that actually have files in storage are eligible.
  // ----------------------------------------------------------------
  const { data: expired, error: fetchError } = await supabase
    .from("generated_content")
    .select("id, storage_bucket, storage_path, user_id, status")
    .lt("storage_expires_at", now)
    .is("storage_deleted_at", null)
    .in("status", ["ready", "auto_pending", "previewed", "downloaded"])
    .order("storage_expires_at", { ascending: true })
    .limit(BATCH_SIZE)
    .returns<ExpiredRow[]>();

  if (fetchError) {
    console.error("expire-content: fetch failed:", fetchError.message);
    return new Response(
      JSON.stringify({ error: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const rows = expired ?? [];

  if (rows.length === 0) {
    console.log("expire-content: nothing to expire");
    return new Response(
      JSON.stringify({ processed: 0, deleted: 0, no_file: 0, errors: 0, results: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log(`expire-content: ${rows.length} row(s) to process`);

  // ----------------------------------------------------------------
  // Process all rows concurrently — allSettled so one failure doesn't
  // prevent the rest from being expired.
  // ----------------------------------------------------------------
  const settled = await Promise.allSettled(
    rows.map((row) => expireRow(row, supabase, now))
  );

  const results: ExpireResult[] = [];
  let deleted  = 0;
  let no_file  = 0;
  let errors   = 0;

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];

    if (outcome.status === "fulfilled") {
      results.push(outcome.value);
      if (outcome.value.outcome === "deleted") {
        deleted++;
      } else if (outcome.value.outcome === "no_file") {
        no_file++;
      } else {
        errors++;
        console.error(
          `expire-content: error id=${outcome.value.id} reason=${outcome.value.reason}`
        );
      }
    } else {
      errors++;
      const row = rows[i];
      console.error(
        `expire-content: unhandled error id=${row.id}:`,
        outcome.reason
      );
      results.push({
        id:      row.id,
        outcome: "error",
        reason:  String(outcome.reason),
      });
    }
  }

  const processed = deleted + no_file + errors;

  console.log(
    `expire-content: complete processed=${processed} deleted=${deleted} no_file=${no_file} errors=${errors}`
  );

  // ----------------------------------------------------------------
  // If we hit the batch limit there may be more rows — signal this to
  // the caller (the cron scheduler can invoke again immediately if needed)
  // ----------------------------------------------------------------
  const hasMore = rows.length === BATCH_SIZE;

  return new Response(
    JSON.stringify({
      processed,
      deleted,
      no_file,
      errors,
      has_more: hasMore,
      results,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
