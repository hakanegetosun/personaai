import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

interface CreatePersonaBody {
  name: string;
  niche: string;
  gender: string;
  style: string;
}

interface PersonaRow {
  id: string;
  user_id: string;
  name: string;
  niche: string;
  gender: string;
  style: string;
  face_image_url: string | null;
  consistency_seed: string | null;
  created_at: string;
  updated_at: string;
}

const VALID_NICHES = ["fitness", "fashion", "lifestyle", "business"] as const;
const VALID_GENDERS = ["male", "female", "non-binary"] as const;
const VALID_STYLES = ["luxury", "casual", "gym", "influencer"] as const;

type Niche = (typeof VALID_NICHES)[number];
type Gender = (typeof VALID_GENDERS)[number];
type Style = (typeof VALID_STYLES)[number];

function isValidNiche(v: string): v is Niche {
  return (VALID_NICHES as readonly string[]).includes(v);
}

function isValidGender(v: string): v is Gender {
  return (VALID_GENDERS as readonly string[]).includes(v);
}

function isValidStyle(v: string): v is Style {
  return (VALID_STYLES as readonly string[]).includes(v);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message: "You must be signed in to create a persona.",
      },
      { status: 401 }
    );
  }

  let body: Partial<CreatePersonaBody>;

  try {
    body = (await req.json()) as Partial<CreatePersonaBody>;
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_BODY",
        message: "Request body must be valid JSON.",
      },
      { status: 400 }
    );
  }

  const { name, niche, gender, style } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Persona name is required.",
      },
      { status: 400 }
    );
  }

  if (name.trim().length > 60) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Persona name must be 60 characters or fewer.",
      },
      { status: 400 }
    );
  }

  if (!niche || !isValidNiche(niche)) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: `niche must be one of: ${VALID_NICHES.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  if (!gender || !isValidGender(gender)) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: `gender must be one of: ${VALID_GENDERS.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  if (!style || !isValidStyle(style)) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: `style must be one of: ${VALID_STYLES.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { data: persona, error: insertError } = await supabase
    .from("personas")
    .insert({
      user_id: user.id,
      name: name.trim(),
      niche,
      gender,
      style,
      face_image_url: null,
      consistency_seed: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    })
    .select(
      "id, user_id, name, niche, gender, style, face_image_url, consistency_seed, created_at, updated_at"
    )
    .single<PersonaRow>();

  if (insertError || !persona) {
    console.error("persona insert error:", insertError?.message);

    return NextResponse.json(
      {
        error: "INSERT_FAILED",
        message: "Failed to create persona. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, persona }, { status: 201 });
}
