"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./reset.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      setError("Please complete both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");
    setLoading(false);

    window.setTimeout(() => {
      router.replace("/login");
    }, 1500);
  }

  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />

      <div className={styles.card}>
        <div className={styles.brandRow}>
          <div className={styles.logomark}>P</div>
          <div className={styles.wordmark}>
            Persona<span>AI</span>
          </div>
        </div>

        <h1 className={styles.heading}>Set a new password</h1>
        <p className={styles.subheading}>
          Choose a new password for your account.
        </p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={passwordId}>New password</label>
            <input
              id={passwordId}
              className={styles.input}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={confirmPasswordId}>Confirm password</label>
            <input
              id={confirmPasswordId}
              className={styles.input}
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.info}>{message}</p>}

          <button
            type="button"
            className={styles.button}
            onClick={() => void handleUpdatePassword()}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}
