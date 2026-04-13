"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InfluencerCategory } from "@/types/category";
import styles from "./CategoryOnboardingForm.module.css";

const CATEGORIES: {
  value: InfluencerCategory;
  label: string;
  mood: string;
  emoji: string;
}[] = [
  { value: "gym_fitness", label: "Gym & Fitness", mood: "Power · Discipline", emoji: "🏋️" },
  { value: "fashion_moda", label: "Fashion", mood: "Style · Aesthetic", emoji: "👗" },
  { value: "beauty_skincare", label: "Beauty & Skincare", mood: "Glow · Ritual", emoji: "✨" },
  { value: "lifestyle", label: "Lifestyle", mood: "Curated · Aspirational", emoji: "🌿" },
  { value: "travel", label: "Travel", mood: "Wander · Discover", emoji: "✈️" },
  { value: "food_culinary", label: "Food & Culinary", mood: "Taste · Craft", emoji: "🍽️" },
  { value: "wellness_selfcare", label: "Wellness", mood: "Restore · Elevate", emoji: "🧘" },
];

interface Props {
  initialCategory: InfluencerCategory | null;
}

export default function CategoryOnboardingForm({ initialCategory }: Props) {
  const [selected, setSelected] = useState<InfluencerCategory | null>(initialCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    if (!selected) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      router.replace(data.redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardGlow} />

      <div className={styles.cardHeader}>
        <p className={styles.cardEyebrow}>Your niche</p>
        <h2 className={styles.cardTitle}>Choose your creative direction</h2>
        <p className={styles.cardSub}>
          This shapes your AI creator&apos;s content style, persona, and monthly
          calendar. You can refine it later.
        </p>
      </div>

      <div className={styles.grid}>
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.value}
            type="button"
            className={`${styles.catCard} ${
              selected === cat.value ? styles.catCardSelected : ""
            }`}
            style={{ animationDelay: `${i * 55}ms` }}
            onClick={() => setSelected(cat.value)}
          >
            {selected === cat.value && <div className={styles.selectedRing} />}

            <div className={styles.catEmoji}>{cat.emoji}</div>
            <div className={styles.catLabel}>{cat.label}</div>
            <div className={styles.catMood}>{cat.mood}</div>

            {selected === cat.value && <div className={styles.checkMark}>✓</div>}
          </button>
        ))}
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.ctaWrap}>
        <button
          className={`${styles.ctaBtn} ${
            !selected || loading ? styles.ctaBtnDisabled : ""
          }`}
          onClick={handleSubmit}
          disabled={!selected || loading}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <span>Continue</span>
              <span className={styles.ctaArrow}>→</span>
            </>
          )}
        </button>

        {!selected && (
          <p className={styles.ctaHint}>Select a category to continue</p>
        )}
      </div>
    </div>
  );
}
