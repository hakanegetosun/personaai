"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

function makeConsistencySeed() {
  return `seed_${Math.random().toString(36).slice(2, 10)}`;
}

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
  step,
  title,
  subtitle,
  children,
}: {
  step: string;
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
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: "rgba(168,85,247,.85)",
            marginBottom: 6,
          }}
        >
          {step}
        </div>
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

export default function CreatePersonaPage() {
  const router = useRouter();

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [gender, setGender] = useState("");
  const [style, setStyle] = useState("");
  const [personality, setPersonality] = useState("");
  const [description, setDescription] = useState("");
  const [faceImageUrl, setFaceImageUrl] = useState("");
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);
const [extraReferenceUrls, setExtraReferenceUrls] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
const [uploadingExtraReference, setUploadingExtraReference] = useState(false);

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

  async function handleImageUpload(file: File) {
    setError(null);
    setUploadingImage(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("persona-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("persona-images")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setFaceImageUrl(publicUrl);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setUploadedImageDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }
async function handleExtraReferenceUpload(file: File) {
  setError(null);
  setUploadingExtraReference(true);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

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

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("persona-images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    setExtraReferenceUrls((prev) => {
      if (prev.includes(publicUrl)) return prev;
      return [...prev, publicUrl].slice(0, 5);
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to upload reference image.");
  } finally {
    setUploadingExtraReference(false);
  }
}

function removeExtraReference(url: string) {
  setExtraReferenceUrls((prev) => prev.filter((item) => item !== url));
}

  const visualPrompt = [
    name || "Unnamed persona",
    niche && `${niche} creator`,
    gender && gender,
    style && `${style} aesthetic`,
    personality && `${personality} energy`,
  ]
    .filter(Boolean)
    .join(", ");

  const brandPrompt = [
    niche && `Primary niche: ${niche}`,
    personality && `Voice: ${personality}`,
    style && `Visual world: ${style}`,
    description && description,
  ]
    .filter(Boolean)
    .join(" · ");

  const contentPrompt = [
    `Create premium social-first content for ${name || "this persona"}.`,
    niche && `Focus on ${niche}.`,
    style && `Keep the style ${style}.`,
    personality && `Tone should feel ${personality}.`,
  ]
    .filter(Boolean)
    .join(" ");

  async function handleSave() {
    setError(null);

    if (!name.trim()) {
      setError("Persona name is required.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const finalImageUrl = faceImageUrl.trim() || null;

const { data: insertedPersona, error: insertError } = await supabase
  .from("personas")
  .insert({
    user_id: user.id,
    name: name.trim(),
    description: description.trim() || null,
    face_image_url: finalImageUrl,
    personality: personality.trim() || null,
    is_custom: true,
    niche: niche.trim() || null,
    gender: gender.trim() || null,
    style: style.trim() || null,
    consistency_seed: makeConsistencySeed(),
  })
  .select("id")
  .single();

if (insertError) throw insertError;

if (finalImageUrl && insertedPersona?.id) {
  const { error: refInsertError } = await supabase
    .from("persona_reference_images")
    .insert({
      persona_id: insertedPersona.id,
      user_id: user.id,
      image_url: finalImageUrl,
      sort_order: 0,
      is_primary: true,
    });

  if (refInsertError) {
    throw refInsertError;
  }
}

if (insertedPersona?.id && extraReferenceUrls.length > 0) {
  const extraRows = extraReferenceUrls.map((url, index) => ({
    persona_id: insertedPersona.id,
    user_id: user.id,
    image_url: url,
    sort_order: index + 1,
    is_primary: false,
  }));

  const { error: extraRefInsertError } = await supabase
    .from("persona_reference_images")
    .insert(extraRows);

  if (extraRefInsertError) {
    throw extraRefInsertError;
  }
}

      router.push("/studio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create persona.");
    } finally {
      setSaving(false);
    }
  }

  const previewImage = uploadedImageDataUrl || faceImageUrl || null;

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
            CREATE PERSONA
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "rgba(255,255,255,.45)",
            }}
          >
            Build a premium creator identity for your studio
          </div>
        </div>

        <Section
          step="Section 1"
          title="Basic Identity"
          subtitle="Define the core profile of your persona."
        >
          <Field label="Persona Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aria Vale"
              style={inputStyle}
            />
          </Field>

          <Field label="Gender Presentation">
            <input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="e.g. Female, Male, Androgynous"
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
          step="Section 2"
          title="Visual Identity"
          subtitle="Choose the aesthetic and attach a reference image if you have one."
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

          <Field label="Reference Image Upload">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 120,
                borderRadius: 16,
                border: "1px dashed rgba(168,85,247,.35)",
                background:
                  "linear-gradient(135deg,rgba(168,85,247,.08),rgba(236,72,153,.05))",
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
                    void handleImageUpload(file);
                  }
                }}
              />
              {uploadingImage ? "Uploading..." : "Upload face / mood reference"}
            </label>
          </Field>

          <Field label="Image URL (optional)">
            <input
              value={faceImageUrl}
              onChange={(e) => setFaceImageUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </Field>

          {previewImage && (
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)",
              }}
            >
              <img
                src={previewImage}
                alt="Persona preview"
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 320,
                  objectFit: "cover",
                }}
              />
            </div>
          )}
<Field label="Extra Reference Images">
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            void handleExtraReferenceUpload(file);
          }
        }}
      />
      {uploadingExtraReference
        ? "Uploading extra reference..."
        : "Add extra reference image (up to 5)"}
    </label>

    {extraReferenceUrls.length > 0 && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {extraReferenceUrls.map((url) => (
          <div
            key={url}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,.08)",
              background: "rgba(255,255,255,.03)",
            }}
          >
            <img
              src={url}
              alt="Reference"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                display: "block",
              }}
            />

            <button
              type="button"
              onClick={() => removeExtraReference(url)}
              style={{
                width: "100%",
                height: 38,
                border: "none",
                borderTop: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.04)",
                color: "rgba(255,255,255,.82)",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}

    <div
      style={{
        fontSize: 11,
        color: "rgba(255,255,255,.40)",
        lineHeight: 1.6,
      }}
    >
      Add different angles, lighting conditions, and expressions of the same person
      to strengthen face consistency across future generations.
    </div>
  </div>
</Field>

        </Section>

        <Section
          step="Section 3"
          title="Brand & Voice"
          subtitle="Define how this persona should feel, speak and show up."
        >
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
              placeholder="Describe the persona, audience, visual world, content direction and overall vibe."
              style={textAreaStyle}
            />
          </Field>
        </Section>

        <Section
          step="Section 4"
          title="Live Prompt Preview"
          subtitle="This gives you a structured preview of how the persona will be interpreted."
        >
          <Field label="Visual Prompt">
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)",
                padding: 14,
                color: "rgba(255,255,255,.86)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {visualPrompt || "Start filling the form to generate a visual prompt preview."}
            </div>
          </Field>

          <Field label="Brand Prompt">
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)",
                padding: 14,
                color: "rgba(255,255,255,.86)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {brandPrompt || "Your brand direction will appear here."}
            </div>
          </Field>

          <Field label="Content Prompt">
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)",
                padding: 14,
                color: "rgba(255,255,255,.86)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {contentPrompt || "Your content generation prompt preview will appear here."}
            </div>
          </Field>
        </Section>

        {error && (
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              background: "rgba(239,68,68,.10)",
              border: "1px solid rgba(239,68,68,.22)",
              color: "rgba(255,255,255,.88)",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {error}
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
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || uploadingImage}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#a855f7,#ec4899)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 14,
              cursor: saving || uploadingImage ? "not-allowed" : "pointer",
              opacity: saving || uploadingImage ? 0.7 : 1,
              fontFamily: "inherit",
              boxShadow: "0 18px 50px rgba(168,85,247,.28)",
            }}
          >
            {uploadingImage ? "Uploading..." : saving ? "Saving..." : "Save Persona"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
