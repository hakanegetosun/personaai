"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./BasicInfoForm.module.css";

type Props = {
  initialName?: string | null;
  initialAge?: number | null;
};

export default function BasicInfoForm({ initialName, initialAge }: Props) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(initialName ?? "");
  const [age, setAge] = useState(initialAge ? String(initialAge) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/direction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: displayName,
          age,
        }),
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
        <p className={styles.cardEyebrow}>Basic profile</p>
        <h2 className={styles.cardTitle}>Add a little context</h2>
        <p className={styles.cardSub}>
          These are optional, but they help shape a more personal creator setup.
        </p>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="display_name">
            Name
          </label>
          <input
            id="display_name"
            className={styles.input}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="age">
            Age
          </label>
          <input
            id="age"
            className={styles.input}
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Optional"
            min="0"
            max="120"
          />
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.ctaWrap}>
        <button
          className={`${styles.ctaBtn} ${loading ? styles.ctaBtnDisabled : ""}`}
          onClick={handleContinue}
          disabled={loading}
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

        <p className={styles.ctaHint}>Both fields are optional</p>
      </div>
    </div>
  );
}
