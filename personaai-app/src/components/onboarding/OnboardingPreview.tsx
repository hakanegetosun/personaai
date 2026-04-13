"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_PREVIEW_BY_CATEGORY } from "@/data/onboarding-preview";
import type { InfluencerCategory } from "@/types/category";
import styles from "./OnboardingPreview.module.css";

type Props = {
  category: InfluencerCategory;
};

export default function OnboardingPreview({ category }: Props) {
  const router = useRouter();
  const preview = ONBOARDING_PREVIEW_BY_CATEGORY[category];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
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
    <div className={styles.wrap}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Preview</p>
        <h2 className={styles.title}>Your creator direction is ready</h2>
        <p className={styles.sub}>
          Based on your category, this is the type of Story and Reel Aviora will
          use to start building your calendar.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.previewCard}>
          <div className={styles.placeholder} />
          <p className={styles.typeLabel}>Story Preview</p>
          <h3 className={styles.cardTitle}>{preview.story.title}</h3>
          <p className={styles.hook}>Hook: {preview.story.hook}</p>
          <p className={styles.caption}>{preview.story.caption}</p>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.placeholder} />
          <p className={styles.typeLabel}>Reel Preview</p>
          <h3 className={styles.cardTitle}>{preview.reel.title}</h3>
          <p className={styles.hook}>Hook: {preview.reel.hook}</p>
          <p className={styles.caption}>{preview.reel.caption}</p>
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <button
        className={`${styles.ctaBtn} ${loading ? styles.ctaBtnDisabled : ""}`}
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create My Calendar and Start"}
      </button>
    </div>
  );
}
