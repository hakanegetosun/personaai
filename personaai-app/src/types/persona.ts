// -----------------------------------------------------------------------
// Persona Types — Unified across:
// - Collection (preset)
// - Studio (active)
// - Supabase (custom)
// - API (/api/generate)
// -----------------------------------------------------------------------

export type PersonaSource = "preset" | "custom";

// -----------------------------------------------------------------------
// 🔹 ACTIVE PERSONA (used everywhere in frontend + API)
// -----------------------------------------------------------------------

export interface ActivePersona {
  id: string;
  name: string;

  niche: string;
  gender: string;
  style: string;

  face_image_url: string | null;

  source: PersonaSource;

  // AI consistency (important for realistic models)
  consistency_seed?: string | null;

  // metadata
  created_at?: string;
}

// -----------------------------------------------------------------------
// 🔹 PRESET (Collection personas)
// -----------------------------------------------------------------------

export interface PresetInfluencer {
  id: string;
  name: string;

  niche: string;
  gender: string;
  style: string;

  face_image_url: string;

  bio: string;
  tags: string[];
}

// -----------------------------------------------------------------------
// 🔹 SUPABASE ROW (database shape)
// -----------------------------------------------------------------------

export interface CustomPersonaRow {
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

// -----------------------------------------------------------------------
// 🔹 API PAYLOAD (for /api/generate)
// -----------------------------------------------------------------------

export interface GenerateRequestPayload {
  persona: ActivePersona;

  // future expansion (optional)
  prompt?: string;
  platform?: "instagram" | "tiktok" | "youtube";
}

// -----------------------------------------------------------------------
// 🔹 STORAGE KEYS
// -----------------------------------------------------------------------

export const ACTIVE_PERSONA_KEY = "active_persona";

// -----------------------------------------------------------------------
// 🔹 STORAGE HELPERS (safe for SSR)
// -----------------------------------------------------------------------

export function saveActivePersona(persona: ActivePersona) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ACTIVE_PERSONA_KEY, JSON.stringify(persona));
  } catch (err) {
    console.warn("[persona] save failed", err);
  }
}

export function loadActivePersona(): ActivePersona | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ACTIVE_PERSONA_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ActivePersona;

    // 🔒 validation (very important)
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearActivePersona() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(ACTIVE_PERSONA_KEY);
  } catch {
    // noop
  }
}

// -----------------------------------------------------------------------
// 🔹 HELPERS
// -----------------------------------------------------------------------

// preset + custom merge (no duplicates)
export function mergePersonas(
  preset: ActivePersona[],
  custom: ActivePersona[]
): ActivePersona[] {
  const seen = new Set<string>();
  const result: ActivePersona[] = [];

  for (const p of [...preset, ...custom]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      result.push(p);
    }
  }

  return result;
}

// fallback safe persona
export function getDefaultPersona(presets: ActivePersona[]): ActivePersona {
  return presets[0];
}
