"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createBrowserClient } from "@supabase/ssr";

const NICHE_OPTIONS = [
  "Fitness",
  "Luxury Lifestyle",
  "Skincare",
  "Fashion",
  "Beauty",
  "Travel",
  "Wellness",
  "Business",
  "Tech",
  "Food",
] as const;

const STYLE_OPTIONS = [
  "Minimal Luxury",
  "Soft Glam",
  "Clean Girl",
  "Sporty Premium",
  "Streetwear",
  "Editorial",
  "Dark Feminine",
  "Old Money",
  "Modern Chic",
  "Warm Natural",
] as const;

const TONE_OPTIONS = [
  "Confident",
  "Warm",
  "Playful",
  "Premium",
  "Bold",
  "Elegant",
  "Calm",
  "Flirty",
] as const;

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(168,85,247,.45)"
          : "1px solid rgba(255,255,255,.10)",
        background: active
          ? "linear-gradient(135deg,rgba(168,85,247,.18),rgba(236,72,153,.12))"
          : "rgba(255,255,255,.04)",
        color: active ? "rgba(255,255,255,.94)" : "rgba(255,255,255,.62)",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 18,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow:
          "0 20px 50px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "rgba(255,255,255,.96)",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,.45)",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>

      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(255,255,255,.78)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

type ReferenceRow = {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

export default function EditPersonaPage() {
  const router = useRouter();
  const params = useParams();
  const personaId = Array.isArray(params.id) ? params.id[0] : params.id;

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingReference, setUploadingReference] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [gender, setGender] = useState("");
  const [style, setStyle] = useState("");
  const [personality, setPersonality] = useState("");
  const [description, setDescription] = useState("");
  const [faceImageUrl, setFaceImageUrl] = useState("");

  const [references, setReferences] = useState<ReferenceRow[]>([]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 48,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.04)",
    color: "rgba(255,255,255,.94)",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const textAreaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 120,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.04)",
    color: "rgba(255,255,255,.94)",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    resize: "vertical",
  };

  useEffect(() => {
    let cancelled = false;

    async function loadPersona() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("You must be logged in.");
        }

        const { data: persona, error: personaError } = await supabase
          .from("personas")
          .select(
            "id, user_id, name, description, face_image_url, personality, niche, gender, style, is_custom"
          )
          .eq("id", personaId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (personaError) throw personaError;
        if (!persona) throw new Error("Persona not found.");
        if (!persona.is_custom) throw new Error("Only custom personas can be edited.");

        const { data: refRows, error: refError } = await supabase
          .from("persona_reference_images")
          .select("id, image_url, is_primary, sort_order")
          .eq("persona_id", personaId)
          .eq("user_id", user.id)
          .order("is_primary", { ascending: false })
          .order("sort_order", { ascending: true });

        if (refError) throw refError;

        if (!cancelled) {
          setName(persona.name ?? "");
          setDescription(persona.description ?? "");
          setFaceImageUrl(persona.face_image_url ?? "");
          setPersonality(persona.personality ?? "");
          setNiche(persona.niche ?? "");
          setGender(persona.gender ?? "");
          setStyle(persona.style ?? "");
          setReferences(refRows ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load persona.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (personaId) {
      void loadPersona();
    }

    return () => {
      cancelled = true;
    };
  }, [personaId, supabase]);

  async function handleUploadReference(file: File) {
    setError(null);
    setSuccess(null);
    setUploadingReference(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in.");

      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/references/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("persona-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("persona-images")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const nextSort =
        references.length > 0
          ? Math.max(...references.map((r) => r.sort_order || 0)) + 1
          : 1;

      const { data: insertedRef, error: insertError } = await supabase
        .from("persona_reference_images")
        .insert({
          persona_id: personaId,
          user_id: user.id,
          image_url: publicUrl,
          sort_order: nextSort,
          is_primary: false,
        })
        .select("id, image_url, is_primary, sort_order")
        .single();

      if (insertError) throw insertError;

      setReferences((prev) => [...prev, insertedRef]);
      setSuccess("Reference image added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload reference.");
    } finally {
      setUploadingReference(false);
    }
  }

  async function handleRemoveReference(refId: string) {
    setError(null);
    setSuccess(null);

    try {
      const target = references.find((r) => r.id === refId);
      if (!target) return;

      if (target.is_primary && references.length > 1) {
        setError("Set another image as primary before deleting the current primary image.");
        return;
      }

      const { error: deleteError } = await supabase
        .from("persona_reference_images")
        .delete()
        .eq("id", refId);

      if (deleteError) throw deleteError;

      const nextReferences = references.filter((r) => r.id !== refId);
      setReferences(nextReferences);

      if (target.is_primary) {
        setFaceImageUrl(nextReferences[0]?.image_url ?? "");
      }

      setSuccess("Reference image removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove reference.");
    }
  }

  async function handleSetPrimary(refId: string) {
    setError(null);
    setSuccess(null);

    try {
      const target = references.find((r) => r.id === refId);
      if (!target) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in.");

      const { error: resetError } = await supabase
        .from("persona_reference_images")
        .update({ is_primary: false })
        .eq("persona_id", personaId)
        .eq("user_id", user.id);

      if (resetError) throw resetError;

      const { error: setPrimaryError } = await supabase
        .from("persona_reference_images")
        .update({ is_primary: true, sort_order: 0 })
        .eq("id", refId)
        .eq("user_id", user.id);

      if (setPrimaryError) throw setPrimaryError;

      const { error: personaUpdateError } = await supabase
        .from("personas")
        .update({ face_image_url: target.image_url })
        .eq("id", personaId)
        .eq("user_id", user.id);

      if (personaUpdateError) throw personaUpdateError;

      setFaceImageUrl(target.image_url);
      setReferences((prev) =>
        prev
          .map((r) => ({
            ...r,
            is_primary: r.id === refId,
          }))
          .sort(
            (a, b) =>
              Number(b.is_primary) - Number(a.is_primary) ||
              a.sort_order - b.sort_order
          )
      );
      setSuccess("Primary reference updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set primary image.");
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in.");

      const { error: updateError } = await supabase
        .from("personas")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          face_image_url: faceImageUrl.trim() || null,
          personality: personality.trim() || null,
          niche: niche.trim() || null,
          gender: gender.trim() || null,
          style: style.trim() || null,
        })
        .eq("id", personaId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setSuccess("Persona updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save persona.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: 24, color: "white" }}>Loading persona...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(255,255,255,.96)",
              lineHeight: 1,
            }}
          >
            EDIT PERSONA
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "rgba(255,255,255,.45)",
            }}
          >
            Update persona details and manage face references
          </div>
        </div>

        <Section
          title="Basic Identity"
          subtitle="Update the core profile of your persona."
        >
          <Field label="Persona Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Gender Presentation">
            <input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Niche">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {NICHE_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={niche === item}
                  onClick={() => setNiche(item)}
                />
              ))}
            </div>
          </Field>
        </Section>

        <Section
          title="Visual Identity"
          subtitle="Adjust the style and manage reference images."
        >
          <Field label="Style / Aesthetic">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STYLE_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={style === item}
                  onClick={() => setStyle(item)}
                />
              ))}
            </div>
          </Field>

          <Field label="Personality / Tone">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TONE_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={personality === item}
                  onClick={() => setPersonality(item)}
                />
              ))}
            </div>
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textAreaStyle}
            />
          </Field>

          {faceImageUrl && (
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)",
              }}
            >
              <img
                src={faceImageUrl}
                alt="Primary reference"
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 320,
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <Field label="Add Reference Image">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 88,
                borderRadius: 16,
                border: "1px dashed rgba(168,85,247,.28)",
                background: "rgba(255,255,255,.03)",
                color: "rgba(255,255,255,.72)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                padding: 16,
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUploadReference(file);
                  }
                }}
              />
              {uploadingReference
                ? "Uploading reference..."
                : "Upload new reference image"}
            </label>
          </Field>

          {references.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {references.map((ref) => (
                <div
                  key={ref.id}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: ref.is_primary
                      ? "1px solid rgba(168,85,247,.45)"
                      : "1px solid rgba(255,255,255,.08)",
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <img
                    src={ref.image_url}
                    alt="Reference"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <div
                    style={{
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: ref.is_primary
                          ? "rgba(220,170,255,.95)"
                          : "rgba(255,255,255,.45)",
                        fontWeight: 800,
                      }}
                    >
                      {ref.is_primary ? "PRIMARY" : "REFERENCE"}
                    </div>

                    {!ref.is_primary && (
                      <button
                        type="button"
                        onClick={() => void handleSetPrimary(ref.id)}
                        style={{
                          width: "100%",
                          height: 36,
                          borderRadius: 10,
                          border: "1px solid rgba(168,85,247,.24)",
                          background: "rgba(168,85,247,.10)",
                          color: "rgba(255,255,255,.88)",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Set as Primary
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleRemoveReference(ref.id)}
                      style={{
                        width: "100%",
                        height: 36,
                        borderRadius: 10,
                        border: "1px solid rgba(239,68,68,.18)",
                        background: "rgba(239,68,68,.08)",
                        color: "rgba(255,255,255,.76)",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {(error || success) && (
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              background: error
                ? "rgba(239,68,68,.10)"
                : "rgba(34,197,94,.10)",
              border: error
                ? "1px solid rgba(239,68,68,.22)"
                : "1px solid rgba(34,197,94,.22)",
              color: "rgba(255,255,255,.88)",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {error || success}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(255,255,255,.04)",
              color: "rgba(255,255,255,.88)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || uploadingReference}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 14,
              cursor:
                saving || uploadingReference ? "not-allowed" : "pointer",
              opacity: saving || uploadingReference ? 0.7 : 1,
              fontFamily: "inherit",
              boxShadow: "0 18px 50px rgba(168,85,247,.28)",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
